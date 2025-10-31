const mockTrains = [
  // Delhi to Mumbai
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
    fare: 750
  },
  {
    trainId: 2,
    number: '12951',
    name: 'Mumbai Rajdhani',
    from: 'New Delhi',
    to: 'Mumbai Central',
    departure: '16:30',
    arrival: '08:35',
    duration: '16h 5m',
    seats: 38,
    fare: 1850
  },
  {
    trainId: 3,
    number: '12953',
    name: 'August Kranti Rajdhani',
    from: 'New Delhi',
    to: 'Mumbai Central',
    departure: '17:55',
    arrival: '10:15',
    duration: '16h 20m',
    seats: 42,
    fare: 1900
  },
  // Delhi to Chennai
  {
    trainId: 4,
    number: '12622',
    name: 'Tamil Nadu Express',
    from: 'New Delhi',
    to: 'Chennai Central',
    departure: '22:30',
    arrival: '07:00',
    duration: '32h 30m',
    seats: 55,
    fare: 1200
  },
  {
    trainId: 5,
    number: '12434',
    name: 'Chennai Rajdhani',
    from: 'New Delhi',
    to: 'Chennai Central',
    departure: '15:55',
    arrival: '09:30',
    duration: '27h 35m',
    seats: 40,
    fare: 2100
  },
  // Mumbai to Bangalore
  {
    trainId: 6,
    number: '12133',
    name: 'Mangalore Express',
    from: 'Mumbai Central',
    to: 'Bangalore City',
    departure: '22:00',
    arrival: '06:00',
    duration: '24h',
    seats: 48,
    fare: 850
  },
  {
    trainId: 7,
    number: '16529',
    name: 'Udyan Express',
    from: 'Mumbai Central',
    to: 'Bangalore City',
    departure: '08:05',
    arrival: '07:30',
    duration: '23h 25m',
    seats: 52,
    fare: 780
  },
  // Bangalore to Hyderabad
  {
    trainId: 8,
    number: '12785',
    name: 'Kacheguda SF Express',
    from: 'Bangalore City',
    to: 'Hyderabad',
    departure: '20:00',
    arrival: '05:50',
    duration: '9h 50m',
    seats: 60,
    fare: 650
  },
  {
    trainId: 9,
    number: '12864',
    name: 'Yesvantpur Express',
    from: 'Bangalore City',
    to: 'Hyderabad',
    departure: '06:00',
    arrival: '15:30',
    duration: '9h 30m',
    seats: 55,
    fare: 620
  },
  // Delhi to Kolkata
  {
    trainId: 10,
    number: '12301',
    name: 'Howrah Rajdhani',
    from: 'New Delhi',
    to: 'Kolkata',
    departure: '16:55',
    arrival: '10:05',
    duration: '17h 10m',
    seats: 45,
    fare: 1950
  },
  {
    trainId: 11,
    number: '12313',
    name: 'Sealdah Rajdhani',
    from: 'New Delhi',
    to: 'Kolkata',
    departure: '16:35',
    arrival: '10:35',
    duration: '18h',
    seats: 42,
    fare: 1900
  },
  // Mumbai to Delhi
  {
    trainId: 12,
    number: '12952',
    name: 'New Delhi Rajdhani',
    from: 'Mumbai Central',
    to: 'New Delhi',
    departure: '17:05',
    arrival: '08:35',
    duration: '15h 30m',
    seats: 50,
    fare: 1850
  },
  {
    trainId: 13,
    number: '12954',
    name: 'August Kranti Rajdhani',
    from: 'Mumbai Central',
    to: 'New Delhi',
    departure: '17:25',
    arrival: '09:55',
    duration: '16h 30m',
    seats: 48,
    fare: 1900
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
