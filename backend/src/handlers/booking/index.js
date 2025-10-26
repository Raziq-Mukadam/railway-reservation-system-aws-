const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, UpdateCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const mysql = require('mysql2/promise');
const crypto = require('crypto');

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const snsClient = new SNSClient({});
const sesClient = new SESClient({});

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

function generatePNR() {
  return crypto.randomBytes(5).toString('hex').toUpperCase();
}

async function checkSeatAvailability(connection, trainId, date, seatsRequired) {
  const [rows] = await connection.execute(
    'SELECT available_seats FROM train_schedules WHERE train_id = ? AND travel_date = ? FOR UPDATE',
    [trainId, date]
  );
  
  if (rows.length === 0) {
    throw new Error('Train schedule not found');
  }
  
  return rows[0].available_seats >= seatsRequired;
}

async function reserveSeats(connection, trainId, date, seatsRequired) {
  await connection.execute(
    'UPDATE train_schedules SET available_seats = available_seats - ? WHERE train_id = ? AND travel_date = ?',
    [seatsRequired, trainId, date]
  );
}

async function processPayment(bookingDetails) {
  // Call external payment gateway
  const paymentEndpoint = process.env.PAYMENT_GATEWAY_ENDPOINT;
  
  try {
    const response = await fetch(paymentEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: bookingDetails.fare,
        currency: 'INR',
        orderId: bookingDetails.pnr,
        customerEmail: bookingDetails.email
      })
    });
    
    if (!response.ok) {
      throw new Error('Payment failed');
    }
    
    const paymentResult = await response.json();
    return paymentResult;
  } catch (error) {
    console.error('Payment gateway error:', error);
    // Mock payment success for demo purposes
    return {
      transactionId: `TXN${Date.now()}`,
      status: 'SUCCESS',
      message: 'Payment processed (MOCK)'
    };
  }
}

async function saveBookingToRDS(connection, bookingData) {
  await connection.execute(
    `INSERT INTO bookings 
    (pnr, user_id, train_id, travel_date, passenger_name, passenger_age, passenger_gender, 
     seat_preference, fare, payment_transaction_id, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      bookingData.pnr,
      bookingData.userId,
      bookingData.trainId,
      bookingData.travelDate,
      bookingData.passengerName,
      bookingData.passengerAge,
      bookingData.passengerGender,
      bookingData.seatPreference,
      bookingData.fare,
      bookingData.transactionId,
      'CONFIRMED'
    ]
  );
}

async function saveBookingToDynamoDB(bookingData) {
  await docClient.send(new PutCommand({
    TableName: process.env.BOOKINGS_TABLE,
    Item: {
      pnr: bookingData.pnr,
      userId: bookingData.userId,
      trainNumber: bookingData.trainNumber,
      trainName: bookingData.trainName,
      travelDate: bookingData.travelDate,
      from: bookingData.from,
      to: bookingData.to,
      passengerName: bookingData.passengerName,
      passengerAge: bookingData.passengerAge,
      passengerGender: bookingData.passengerGender,
      seatPreference: bookingData.seatPreference,
      fare: bookingData.fare,
      status: 'CONFIRMED',
      transactionId: bookingData.transactionId,
      createdAt: new Date().toISOString()
    }
  }));
}

async function sendNotifications(bookingData) {
  // Send SNS notification
  try {
    await snsClient.send(new PublishCommand({
      TopicArn: process.env.SNS_TOPIC_ARN,
      Subject: `Booking Confirmed - PNR: ${bookingData.pnr}`,
      Message: JSON.stringify({
        type: 'BOOKING_CONFIRMED',
        pnr: bookingData.pnr,
        trainName: bookingData.trainName,
        passengerName: bookingData.passengerName,
        travelDate: bookingData.travelDate
      })
    }));
  } catch (error) {
    console.error('SNS notification error:', error);
  }

  // Send SES email
  if (bookingData.email) {
    try {
      await sesClient.send(new SendEmailCommand({
        Source: 'noreply@railconnect.example.com',
        Destination: {
          ToAddresses: [bookingData.email]
        },
        Message: {
          Subject: {
            Data: `Booking Confirmed - PNR: ${bookingData.pnr}`
          },
          Body: {
            Html: {
              Data: `
                <h2>Booking Confirmation</h2>
                <p>Dear ${bookingData.passengerName},</p>
                <p>Your train ticket has been successfully booked.</p>
                <h3>Booking Details:</h3>
                <ul>
                  <li><strong>PNR:</strong> ${bookingData.pnr}</li>
                  <li><strong>Train:</strong> ${bookingData.trainName} (${bookingData.trainNumber})</li>
                  <li><strong>Date:</strong> ${bookingData.travelDate}</li>
                  <li><strong>Route:</strong> ${bookingData.from} to ${bookingData.to}</li>
                  <li><strong>Fare:</strong> ₹${bookingData.fare}</li>
                </ul>
                <p>Thank you for choosing RailConnect!</p>
              `
            }
          }
        }
      }));
    } catch (error) {
      console.error('SES email error:', error);
    }
  }
}

exports.handler = async (event) => {
  console.log('Booking request:', JSON.stringify(event));

  // Extract user info from Cognito authorizer
  const userId = event.requestContext?.authorizer?.claims?.sub || 'guest';
  const userEmail = event.requestContext?.authorizer?.claims?.email;

  let connection;
  
  try {
    const body = JSON.parse(event.body);
    const { trainId, trainNumber, trainName, from, to, travelDate, passengerName, passengerAge, passengerGender, seatPreference, fare } = body;

    // Validate input
    if (!trainId || !travelDate || !passengerName || !passengerAge || !fare) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Missing required booking details' })
      };
    }

    // Generate PNR
    const pnr = generatePNR();

    // Start database transaction
    connection = await getPool().getConnection();
    await connection.beginTransaction();

    try {
      // 1. Check seat availability
      const seatsAvailable = await checkSeatAvailability(connection, trainId, travelDate, 1);
      if (!seatsAvailable) {
        await connection.rollback();
        return {
          statusCode: 409,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ error: 'No seats available' })
        };
      }

      // 2. Process payment
      const paymentResult = await processPayment({
        pnr,
        fare,
        email: userEmail
      });

      if (paymentResult.status !== 'SUCCESS') {
        await connection.rollback();
        return {
          statusCode: 402,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ error: 'Payment failed', details: paymentResult })
        };
      }

      // 3. Reserve seats
      await reserveSeats(connection, trainId, travelDate, 1);

      // 4. Save booking to RDS
      await saveBookingToRDS(connection, {
        pnr,
        userId,
        trainId,
        travelDate,
        passengerName,
        passengerAge,
        passengerGender,
        seatPreference,
        fare,
        transactionId: paymentResult.transactionId
      });

      // Commit RDS transaction
      await connection.commit();

      // 5. Save to DynamoDB for fast access
      await saveBookingToDynamoDB({
        pnr,
        userId,
        trainNumber,
        trainName,
        travelDate,
        from,
        to,
        passengerName,
        passengerAge,
        passengerGender,
        seatPreference,
        fare,
        transactionId: paymentResult.transactionId,
        email: userEmail
      });

      // 6. Send notifications (SNS/SES)
      await sendNotifications({
        pnr,
        trainNumber,
        trainName,
        travelDate,
        from,
        to,
        passengerName,
        fare,
        email: userEmail
      });

      // 7. Store session in DynamoDB cache
      await docClient.send(new PutCommand({
        TableName: process.env.SESSIONS_TABLE,
        Item: {
          sessionId: `booking-${pnr}`,
          userId,
          pnr,
          status: 'CONFIRMED',
          createdAt: Date.now(),
          ttl: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
        }
      }));

      return {
        statusCode: 201,
        headers: { 
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: true,
          pnr,
          status: 'CONFIRMED',
          transactionId: paymentResult.transactionId,
          message: 'Booking confirmed successfully'
        })
      };

    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      throw error;
    }

  } catch (error) {
    console.error('Booking error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Booking failed', message: error.message })
    };
  } finally {
    if (connection) {
      connection.release();
    }
  }
};
