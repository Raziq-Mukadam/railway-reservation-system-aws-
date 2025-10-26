const mockTrains = [
  {
    trainId: 1,
    number: '12001',
    name: 'Shatabdi Express',
    from: 'New Delhi',
    to: 'Mumbai Central',
    departure: '08:00',
    arrival: '14:00',
    duration: '6h',
    seats: 45,
    fare: 750,
    class: 'Sleeper'
  },
  {
    trainId: 2,
    number: '12022',
    name: 'Rajdhani Express',
    from: 'New Delhi',
    to: 'Chennai Central',
    departure: '10:30',
    arrival: '16:30',
    duration: '6h',
    seats: 32,
    fare: 1200,
    class: 'AC-3'
  },
  {
    trainId: 3,
    number: '12033',
    name: 'Duronto Express',
    from: 'Mumbai Central',
    to: 'Bangalore City',
    departure: '22:00',
    arrival: '06:00',
    duration: '8h',
    seats: 28,
    fare: 850,
    class: 'AC-2'
  }
];

exports.handler = async (event) => {
  console.log('Search request:', JSON.stringify(event));
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS' || event.requestContext?.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Handle both direct Lambda invoke and API Gateway formats
    const params = event.queryStringParameters || event.params?.querystring || {};
    const { from, to, date } = params;
    
    console.log('Query params:', params);

    if (!from || !to) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required parameters: from, to' })
      };
    }

    // Filter trains based on search
    console.log('Filtering trains with from:', from, 'to:', to);
    const results = mockTrains
      .filter(t => {
        const fromMatch = !from || t.from.toLowerCase().includes(from.toLowerCase());
        const toMatch = !to || t.to.toLowerCase().includes(to.toLowerCase());
        console.log(`Train ${t.name}: fromMatch=${fromMatch}, toMatch=${toMatch}`);
        return fromMatch && toMatch;
      })
      .map(t => ({
        ...t,
        date: date || new Date().toISOString().slice(0, 10)
      }));
    
    console.log('Found trains:', results.length);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ trains: results })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', message: error.message })
    };
  }
};
