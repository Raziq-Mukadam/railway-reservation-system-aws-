const bookings = {}; // In-memory storage (resets on Lambda cold start)

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

  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
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
      fare
    } = body;

    // Validate
    if (!trainId || !passengerName || !passengerAge || !fare) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required booking details' })
      };
    }

    // Generate PNR
    const pnr = generatePNR();

    // Create booking
    const booking = {
      pnr,
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
      status: 'CONFIRMED',
      transactionId: `TXN${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    // Store booking (in memory - will reset)
    bookings[pnr] = booking;

    console.log('Booking created:', booking);

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        pnr,
        status: 'CONFIRMED',
        transactionId: booking.transactionId,
        message: 'Booking confirmed successfully'
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
