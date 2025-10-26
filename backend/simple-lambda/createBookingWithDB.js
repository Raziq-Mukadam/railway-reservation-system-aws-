// This version uses DynamoDB for persistent storage
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

function generatePNR() {
  return Math.random().toString(36).substring(2, 12).toUpperCase();
}

exports.handler = async (event) => {
  console.log('Booking request:', JSON.stringify(event));
  
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
    const body = JSON.parse(event.body || '{}');
    const {
      trainId,
      trainNumber,
      trainName,
      from,
      to,
      travelDate,
      passengerName,
      passengerAge,
      passengerGender,
      seatPreference,
      fare,
      paymentStatus
    } = body;

    if (!trainId || !passengerName || !passengerAge || !fare) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required booking details' })
      };
    }

    const pnr = generatePNR();
    const status = paymentStatus === 'PENDING' ? 'PENDING' : 'CONFIRMED';
    
    const booking = {
      pnr,
      userId: 'guest', // In real app, get from auth token
      trainId,
      trainNumber,
      trainName,
      from,
      to,
      travelDate,
      passengerName,
      passengerAge,
      passengerGender,
      seatPreference,
      fare,
      status: status,
      paymentStatus: paymentStatus || 'CONFIRMED',
      transactionId: status === 'CONFIRMED' ? `TXN${Date.now()}` : null,
      createdAt: new Date().toISOString()
    };

    // Save to DynamoDB
    await docClient.send(new PutCommand({
      TableName: process.env.BOOKINGS_TABLE || 'railway-bookings',
      Item: booking
    }));

    console.log('Booking saved to DynamoDB:', booking);

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        pnr,
        status: status,
        transactionId: booking.transactionId,
        message: status === 'PENDING' ? 'Booking created. Payment pending.' : 'Booking confirmed successfully'
      })
    };

  } catch (error) {
    console.error('Booking error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Booking failed', message: error.message })
    };
  }
};
