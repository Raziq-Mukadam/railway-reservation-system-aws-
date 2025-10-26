# Railway Reservation System - AWS Backend

Complete AWS serverless backend implementing the architecture diagram with:
- **API Gateway** - REST API entry point
- **AWS Lambda** - Booking logic and business operations
- **Amazon RDS (MySQL)** - Trains and tickets database
- **DynamoDB** - Session cache and fast booking lookups
- **AWS Cognito** - User authentication
- **Payment Gateway** - External payment integration
- **SNS/SES** - Booking confirmation notifications
- **CloudWatch** - Monitoring and logging

## Architecture Flow

```
Browser/Mobile App → S3 (Static Hosting) → API Gateway → Lambda Functions
                                                ↓
                                    ┌───────────┴───────────┐
                                    ↓                       ↓
                            Amazon RDS (Trains DB)   DynamoDB (Sessions/Cache)
                                    ↓                       ↓
                            Payment Gateway         SES/SNS (Notifications)
                                    ↓
                        User Sees Ticket Confirmation
```

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
3. **AWS SAM CLI** installed ([Installation Guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html))
4. **Node.js 18+** installed
5. **MySQL client** (optional, for database setup)

## Quick Start

### 1. Install Dependencies

```powershell
cd backend
npm run install-deps
```

### 2. Set Up RDS Database

**Option A: Using AWS Console**
1. Create an RDS MySQL instance in AWS Console
2. Note the endpoint, username, and password
3. Connect to the database and run `database/schema.sql`

**Option B: Using AWS CLI**
```powershell
# Create RDS instance
aws rds create-db-instance `
  --db-instance-identifier railway-db `
  --db-instance-class db.t3.micro `
  --engine mysql `
  --master-username admin `
  --master-user-password YourPassword123 `
  --allocated-storage 20

# Wait for instance to be available
aws rds wait db-instance-available --db-instance-identifier railway-db

# Get endpoint
aws rds describe-db-instances --db-instance-identifier railway-db --query 'DBInstances[0].Endpoint.Address'
```

**Load Schema:**
```powershell
mysql -h your-rds-endpoint.rds.amazonaws.com -u admin -p < database/schema.sql
```

### 3. Deploy Backend

```powershell
# First time deployment (guided)
sam build
sam deploy --guided
```

**During guided deployment, provide:**
- Stack Name: `railway-reservation-system`
- AWS Region: `us-east-1` (or your preferred region)
- DBHost: Your RDS endpoint
- DBName: `railway_db`
- DBUser: `admin`
- DBPassword: Your RDS password
- Confirm changes: `y`
- Allow SAM CLI IAM role creation: `y`
- Save to config file: `y`

**Subsequent deployments:**
```powershell
sam build
sam deploy
```

### 4. Note the Outputs

After deployment, SAM will output:
- `ApiEndpoint` - Your API Gateway URL
- `UserPoolId` - Cognito User Pool ID
- `UserPoolClientId` - Cognito Client ID

Save these values for frontend configuration.

### 5. Configure Frontend

Create `frontend/.env` from the template:

```powershell
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env` with your deployed values:
```env
VITE_API_ENDPOINT=https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/prod
VITE_AWS_REGION=us-east-1
VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 6. Test the API

```powershell
# Search trains
curl "https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/prod/trains/search?from=New%20Delhi&to=Mumbai%20Central&date=2025-11-01"

# Health check
curl "https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/prod/"
```

## Frontend Deployment to S3

### 1. Build Frontend

```powershell
cd frontend
npm install
npm run build
```

### 2. Create S3 Bucket

```powershell
# Create bucket
aws s3 mb s3://railway-reservation-frontend

# Enable static website hosting
aws s3 website s3://railway-reservation-frontend --index-document index.html --error-document index.html

# Upload files
aws s3 sync dist/ s3://railway-reservation-frontend --acl public-read
```

### 3. Configure Bucket Policy

Create `bucket-policy.json`:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::railway-reservation-frontend/*"
    }
  ]
}
```

Apply policy:
```powershell
aws s3api put-bucket-policy --bucket railway-reservation-frontend --policy file://bucket-policy.json
```

### 4. Access Your App

Visit: `http://railway-reservation-frontend.s3-website-us-east-1.amazonaws.com`

## Local Development

### Run API Locally

```powershell
# Set environment variables
$env:TRAINS_DB_HOST="localhost"
$env:TRAINS_DB_NAME="railway_db"
$env:TRAINS_DB_USER="root"
$env:TRAINS_DB_PASSWORD="password"
$env:SESSIONS_TABLE="railway-sessions"
$env:BOOKINGS_TABLE="railway-bookings"

# Start local API
sam local start-api --port 3000
```

### Run Frontend Locally

```powershell
cd frontend
npm run dev
```

Frontend will run on `http://localhost:5173`

## Project Structure

```
backend/
├── template.yaml              # SAM template (infrastructure as code)
├── package.json               # Build scripts
├── database/
│   └── schema.sql            # RDS database schema
├── monitoring/
│   └── cloudwatch-config.md  # CloudWatch setup
└── src/
    └── handlers/
        ├── searchTrains/     # Search trains Lambda
        ├── booking/          # Create booking Lambda
        ├── getBookings/      # Get user bookings Lambda
        └── cancelBooking/    # Cancel booking Lambda

frontend/
├── src/
│   ├── utils/
│   │   └── api.js           # API client with AWS integration
│   ├── pages/               # Updated to call real APIs
│   └── components/          # Updated to call real APIs
└── .env                     # AWS configuration
```

## API Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/trains/search` | No | Search trains by route and date |
| POST | `/bookings` | Yes | Create new booking |
| GET | `/bookings` | Yes | Get user's bookings |
| DELETE | `/bookings/{pnr}` | Yes | Cancel booking |

## Authentication

Users must authenticate via AWS Cognito to book or manage tickets.

### Sign Up (via Cognito SDK or AWS Console)

```javascript
// In your frontend, use AWS Amplify or Cognito SDK
import { CognitoUserPool } from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: 'VITE_COGNITO_USER_POOL_ID',
  ClientId: 'VITE_COGNITO_CLIENT_ID'
};

const userPool = new CognitoUserPool(poolData);
```

## Monitoring

### View Logs

```powershell
# Tail all function logs
sam logs --tail

# Specific function
sam logs -n BookingFunction --tail

# CloudWatch Insights
aws logs start-query --log-group-name /aws/lambda/BookingFunction --query-string "fields @timestamp, @message | filter @message like /error/"
```

### CloudWatch Dashboard

Navigate to CloudWatch Console and create dashboard with:
- Lambda invocations and errors
- API Gateway latency and 4xx/5xx errors
- DynamoDB read/write capacity
- RDS connections and CPU

See `backend/monitoring/cloudwatch-config.md` for detailed setup.

## Cost Estimation

**Monthly cost for moderate usage (~1000 bookings/month):**

- API Gateway: ~$3.50
- Lambda: ~$0.20 (within free tier)
- DynamoDB: ~$2.50 (PAY_PER_REQUEST)
- RDS t3.micro: ~$15/month
- S3 + CloudFront: ~$0.50
- Cognito: Free (< 50K MAU)
- **Total: ~$22/month**

## Troubleshooting

### Lambda Function Errors

```powershell
# Check logs
sam logs -n BookingFunction --tail

# Invoke function locally for testing
sam local invoke BookingFunction -e test-events/booking.json
```

### Database Connection Issues

- Ensure Lambda functions are in same VPC as RDS (or RDS is publicly accessible for testing)
- Check security groups allow MySQL port 3306
- Verify database credentials in template.yaml parameters

### CORS Errors

- Ensure API Gateway has CORS enabled (configured in template.yaml)
- Check that frontend is sending requests to correct API endpoint

### Cognito Authentication Issues

- Verify User Pool ID and Client ID in frontend .env
- Check that API Gateway authorizer is configured correctly
- Ensure tokens are being sent in Authorization header

## Clean Up

To delete all AWS resources:

```powershell
# Delete CloudFormation stack
sam delete

# Delete S3 bucket
aws s3 rb s3://railway-reservation-frontend --force

# Delete RDS instance
aws rds delete-db-instance --db-instance-identifier railway-db --skip-final-snapshot
```

## Next Steps

1. **Add CloudFront** for better frontend performance
2. **Implement payment gateway** integration (Stripe/Razorpay)
3. **Add email verification** in Cognito
4. **Set up CI/CD** with AWS CodePipeline
5. **Add caching** with ElastiCache
6. **Implement seat selection** logic
7. **Add admin portal** for train management

## Support

For issues or questions, refer to:
- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [Amazon Cognito Documentation](https://docs.aws.amazon.com/cognito/)
