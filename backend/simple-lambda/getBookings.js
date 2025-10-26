// Get all bookings for a user
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  console.log('Get bookings request:', JSON.stringify(event));
  
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
    // For demo, we'll scan all bookings
    // In production, filter by userId from auth token
    const result = await docClient.send(new ScanCommand({
      TableName: process.env.BOOKINGS_TABLE || 'railway-bookings'
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        bookings: result.Items || []
      })
    };

  } catch (error) {
    console.error('Error fetching bookings:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch bookings', message: error.message })
    };
  }
};
