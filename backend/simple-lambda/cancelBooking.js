// Cancel a booking
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  console.log('Cancel booking request:', JSON.stringify(event));
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const pnr = event.pathParameters?.pnr;

    if (!pnr) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'PNR is required' })
      };
    }

    // Get booking
    const getResult = await docClient.send(new GetCommand({
      TableName: process.env.BOOKINGS_TABLE || 'railway-bookings',
      Key: { pnr }
    }));

    if (!getResult.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Booking not found' })
      };
    }

    if (getResult.Item.status === 'CANCELLED') {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({ error: 'Booking already cancelled' })
      };
    }

    // Update booking status
    await docClient.send(new UpdateCommand({
      TableName: process.env.BOOKINGS_TABLE || 'railway-bookings',
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

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        pnr,
        status: 'CANCELLED',
        message: 'Booking cancelled successfully'
      })
    };

  } catch (error) {
    console.error('Cancellation error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to cancel booking', message: error.message })
    };
  }
};
