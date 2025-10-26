const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const mysql = require('mysql2/promise');

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const snsClient = new SNSClient({});

let pool;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.TRAINS_DB_HOST,
      user: process.env.TRAINS_DB_USER,
      password: process.env.TRAINS_DB_PASSWORD,
      database: process.env.TRAINS_DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }
  return pool;
}

async function releaseSeats(connection, trainId, travelDate, seats) {
  await connection.execute(
    'UPDATE train_schedules SET available_seats = available_seats + ? WHERE train_id = ? AND travel_date = ?',
    [seats, trainId, travelDate]
  );
}

async function cancelBookingInRDS(connection, pnr) {
  const [rows] = await connection.execute(
    'SELECT train_id, travel_date FROM bookings WHERE pnr = ? AND status = "CONFIRMED"',
    [pnr]
  );

  if (rows.length === 0) {
    throw new Error('Booking not found or already cancelled');
  }

  await connection.execute(
    'UPDATE bookings SET status = "CANCELLED", cancelled_at = NOW() WHERE pnr = ?',
    [pnr]
  );

  return rows[0];
}

exports.handler = async (event) => {
  console.log('Cancel booking request:', JSON.stringify(event));

  const pnr = event.pathParameters?.pnr;
  const userId = event.requestContext?.authorizer?.claims?.sub;

  if (!pnr) {
    return {
      statusCode: 400,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'PNR is required' })
    };
  }

  if (!userId) {
    return {
      statusCode: 401,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }

  let connection;

  try {
    // 1. Get booking from DynamoDB to verify ownership
    const bookingResult = await docClient.send(new GetCommand({
      TableName: process.env.BOOKINGS_TABLE,
      Key: { pnr }
    }));

    if (!bookingResult.Item) {
      return {
        statusCode: 404,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Booking not found' })
      };
    }

    if (bookingResult.Item.userId !== userId) {
      return {
        statusCode: 403,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Not authorized to cancel this booking' })
      };
    }

    if (bookingResult.Item.status === 'CANCELLED') {
      return {
        statusCode: 409,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Booking already cancelled' })
      };
    }

    // 2. Start database transaction
    connection = await getPool().getConnection();
    await connection.beginTransaction();

    try {
      // 3. Cancel in RDS and get train details
      const { train_id, travel_date } = await cancelBookingInRDS(connection, pnr);

      // 4. Release seat back to inventory
      await releaseSeats(connection, train_id, travel_date, 1);

      // Commit transaction
      await connection.commit();

      // 5. Update DynamoDB
      await docClient.send(new UpdateCommand({
        TableName: process.env.BOOKINGS_TABLE,
        Key: { pnr },
        UpdateExpression: 'SET #status = :status, cancelledAt = :cancelledAt',
        ExpressionAttributeNames: {
          '#status': 'status'
        },
        ExpressionAttributeValues: {
          ':status': 'CANCELLED',
          ':cancelledAt': new Date().toISOString()
        }
      }));

      // 6. Send cancellation notification
      try {
        await snsClient.send(new PublishCommand({
          TopicArn: process.env.SNS_TOPIC_ARN,
          Subject: `Booking Cancelled - PNR: ${pnr}`,
          Message: JSON.stringify({
            type: 'BOOKING_CANCELLED',
            pnr,
            userId,
            cancelledAt: new Date().toISOString()
          })
        }));
      } catch (error) {
        console.error('SNS notification error:', error);
      }

      return {
        statusCode: 200,
        headers: { 
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: true,
          pnr,
          status: 'CANCELLED',
          message: 'Booking cancelled successfully'
        })
      };

    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      throw error;
    }

  } catch (error) {
    console.error('Cancellation error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to cancel booking', message: error.message })
    };
  } finally {
    if (connection) {
      connection.release();
    }
  }
};
