// Send Email/SMS notification after booking
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const snsClient = new SNSClient({});
const sesClient = new SESClient({ region: 'us-east-1' });

// Email template for booking confirmation
function getEmailTemplate(booking) {
  return {
    subject: `Railway Booking Confirmed - PNR: ${booking.pnr}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .ticket { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #4F46E5; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          .status { display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
          .confirmed { background: #10b981; color: white; }
          .pending { background: #f59e0b; color: white; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚂 RailConnect</h1>
            <p>Booking Confirmation</p>
          </div>
          
          <div class="content">
            <h2>Your booking is ${booking.status === 'CONFIRMED' ? 'confirmed' : 'pending'}!</h2>
            <span class="status ${booking.status === 'CONFIRMED' ? 'confirmed' : 'pending'}">
              ${booking.status}
            </span>
            
            <div class="ticket">
              <h3>📋 Booking Details</h3>
              <p><strong>PNR:</strong> ${booking.pnr}</p>
              <p><strong>Passenger:</strong> ${booking.passengerName}</p>
              <p><strong>Train:</strong> ${booking.trainName} (${booking.trainNumber})</p>
              <p><strong>Route:</strong> ${booking.from} → ${booking.to}</p>
              <p><strong>Travel Date:</strong> ${booking.travelDate}</p>
              <p><strong>Class:</strong> ${booking.trainClass}</p>
              <p><strong>Seat Preference:</strong> ${booking.seatPreference}</p>
              <p><strong>Fare:</strong> ₹${booking.fare}</p>
              ${booking.transactionId ? `<p><strong>Transaction ID:</strong> ${booking.transactionId}</p>` : ''}
              ${booking.status === 'PENDING' ? '<p style="color: #f59e0b;"><strong>⚠️ Payment Pending</strong> - Please complete payment to confirm booking.</p>' : ''}
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 8px;">
              <p style="margin: 0;"><strong>📱 Important:</strong> Please carry a valid ID proof during travel.</p>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for choosing RailConnect!</p>
            <p>For support, contact us at support@railconnect.com</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Railway Booking Confirmation

PNR: ${booking.pnr}
Status: ${booking.status}

Passenger: ${booking.passengerName}
Train: ${booking.trainName} (${booking.trainNumber})
From: ${booking.from}
To: ${booking.to}
Date: ${booking.travelDate}
Class: ${booking.trainClass}
Seat: ${booking.seatPreference}
Fare: ₹${booking.fare}
${booking.transactionId ? `Transaction ID: ${booking.transactionId}` : ''}

${booking.status === 'PENDING' ? 'Payment is pending. Please complete payment to confirm booking.' : 'Your booking is confirmed!'}

Thank you for choosing RailConnect!
    `
  };
}

// Send Email via SES
async function sendEmail(booking, toEmail) {
  const template = getEmailTemplate(booking);
  
  const params = {
    Source: process.env.SENDER_EMAIL || 'noreply@railconnect.com', // Must be verified in SES
    Destination: {
      ToAddresses: [toEmail]
    },
    Message: {
      Subject: {
        Data: template.subject,
        Charset: 'UTF-8'
      },
      Body: {
        Html: {
          Data: template.html,
          Charset: 'UTF-8'
        },
        Text: {
          Data: template.text,
          Charset: 'UTF-8'
        }
      }
    }
  };

  try {
    const command = new SendEmailCommand(params);
    const result = await sesClient.send(command);
    console.log('Email sent successfully:', result.MessageId);
    return { success: true, messageId: result.MessageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    // Don't throw error - notification failure shouldn't fail booking
    return { success: false, error: error.message };
  }
}

// Send SMS via SNS
async function sendSMS(booking, phoneNumber) {
  const message = `RailConnect: Your booking is ${booking.status}! PNR: ${booking.pnr}, Train: ${booking.trainName}, Date: ${booking.travelDate}, Fare: ₹${booking.fare}. ${booking.status === 'PENDING' ? 'Payment pending.' : 'Confirmed!'}`;
  
  const params = {
    Message: message,
    PhoneNumber: phoneNumber // Must include country code, e.g., +919876543210
  };

  try {
    const command = new PublishCommand(params);
    const result = await snsClient.send(command);
    console.log('SMS sent successfully:', result.MessageId);
    return { success: true, messageId: result.MessageId };
  } catch (error) {
    console.error('SMS sending failed:', error);
    return { success: false, error: error.message };
  }
}

// Lambda handler
exports.handler = async (event) => {
  console.log('Notification request:', JSON.stringify(event));
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { booking, email, phone } = body;

    if (!booking || !booking.pnr) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid booking data' })
      };
    }

    const results = {
      email: null,
      sms: null
    };

    // Send email if provided
    if (email) {
      results.email = await sendEmail(booking, email);
    }

    // Send SMS if provided
    if (phone) {
      results.sms = await sendSMS(booking, phone);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Notifications sent',
        results
      })
    };

  } catch (error) {
    console.error('Notification error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to send notifications', message: error.message })
    };
  }
};
