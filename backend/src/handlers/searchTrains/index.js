const { RDSDataService } = require('@aws-sdk/client-rds-data');
const mysql = require('mysql2/promise');

// Database connection pool
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

exports.handler = async (event) => {
  console.log('Search request:', JSON.stringify(event));

  try {
    const { from, to, date } = event.queryStringParameters || {};

    if (!from || !to || !date) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Missing required parameters: from, to, date' })
      };
    }

    const connection = await getPool().getConnection();

    try {
      // Query trains matching route and date
      const [trains] = await connection.execute(
        `SELECT 
          t.train_id, 
          t.train_number, 
          t.train_name,
          r.departure_station,
          r.arrival_station,
          r.departure_time,
          r.arrival_time,
          r.duration_hours,
          ts.available_seats,
          ts.fare,
          ts.seat_class
        FROM trains t
        INNER JOIN routes r ON t.train_id = r.train_id
        INNER JOIN train_schedules ts ON t.train_id = ts.train_id
        WHERE r.departure_station = ? 
          AND r.arrival_station = ?
          AND ts.travel_date = ?
          AND ts.available_seats > 0
        ORDER BY r.departure_time`,
        [from, to, date]
      );

      return {
        statusCode: 200,
        headers: { 
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          trains: trains.map(t => ({
            trainId: t.train_id,
            number: t.train_number,
            name: t.train_name,
            from: t.departure_station,
            to: t.arrival_station,
            departure: t.departure_time,
            arrival: t.arrival_time,
            duration: `${t.duration_hours}h`,
            seats: t.available_seats,
            fare: t.fare,
            class: t.seat_class,
            date
          }))
        })
      };
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error searching trains:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to search trains', message: error.message })
    };
  }
};
