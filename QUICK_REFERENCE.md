# Quick Reference Guide

## 🚀 Deployment Commands

### Backend Deployment
```powershell
# Navigate to backend
cd backend

# Install all Lambda dependencies
npm run install-deps

# Build SAM application
sam build

# First deployment (interactive)
sam deploy --guided

# Subsequent deployments
sam deploy

# Production deployment
sam deploy --config-env prod
```

### Frontend Deployment
```powershell
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Deploy to S3
aws s3 sync dist/ s3://railway-reservation-frontend --delete

# Or use the convenience script
npm run deploy
```

## 🔧 Local Development

### Run Backend Locally
```powershell
cd backend

# Start local API Gateway
sam local start-api --port 3000

# Test specific function
sam local invoke BookingFunction -e test-events/booking.json

# Start with environment variables
sam local start-api --env-vars env.json
```

### Run Frontend Locally
```powershell
cd frontend

# Development server
npm run dev

# Preview production build
npm run build
npm run preview
```

### Local Database Setup
```powershell
# Install MySQL locally
# Create database
mysql -u root -p
CREATE DATABASE railway_db;
exit

# Load schema
mysql -u root -p railway_db < backend/database/schema.sql
```

## 📋 Common AWS CLI Commands

### RDS Operations
```powershell
# Create RDS instance
aws rds create-db-instance `
  --db-instance-identifier railway-db `
  --db-instance-class db.t3.micro `
  --engine mysql `
  --master-username admin `
  --master-user-password YourPassword123 `
  --allocated-storage 20

# Get RDS endpoint
aws rds describe-db-instances `
  --db-instance-identifier railway-db `
  --query 'DBInstances[0].Endpoint.Address'

# Delete RDS instance
aws rds delete-db-instance `
  --db-instance-identifier railway-db `
  --skip-final-snapshot
```

### DynamoDB Operations
```powershell
# List tables
aws dynamodb list-tables

# Describe table
aws dynamodb describe-table --table-name railway-bookings

# Query items
aws dynamodb query `
  --table-name railway-bookings `
  --index-name userId-index `
  --key-condition-expression "userId = :uid" `
  --expression-attribute-values '{":uid":{"S":"user123"}}'
```

### S3 Operations
```powershell
# Create bucket
aws s3 mb s3://railway-reservation-frontend

# Sync files
aws s3 sync frontend/dist/ s3://railway-reservation-frontend

# Enable static website hosting
aws s3 website s3://railway-reservation-frontend `
  --index-document index.html `
  --error-document index.html

# Delete bucket
aws s3 rb s3://railway-reservation-frontend --force
```

### CloudWatch Logs
```powershell
# Tail logs
sam logs --tail

# Specific function logs
sam logs -n BookingFunction --tail

# Filter logs
sam logs -n BookingFunction --filter "ERROR"

# Get logs for specific time
sam logs -n BookingFunction --start-time '10min ago'
```

### Cognito Operations
```powershell
# List user pools
aws cognito-idp list-user-pools --max-results 10

# Create user
aws cognito-idp admin-create-user `
  --user-pool-id us-east-1_XXXXXXXXX `
  --username user@example.com `
  --user-attributes Name=email,Value=user@example.com Name=email_verified,Value=true

# Delete user
aws cognito-idp admin-delete-user `
  --user-pool-id us-east-1_XXXXXXXXX `
  --username user@example.com
```

## 🧪 Testing Commands

### API Testing
```powershell
# Search trains (no auth required)
curl "https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/prod/trains/search?from=New%20Delhi&to=Mumbai%20Central&date=2025-11-01"

# Create booking (requires auth)
curl -X POST https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/prod/bookings `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{"trainId":1,"trainNumber":"12001","trainName":"Express","travelDate":"2025-11-01","passengerName":"John Doe","passengerAge":30,"fare":750}'

# Get bookings (requires auth)
curl https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/prod/bookings `
  -H "Authorization: Bearer YOUR_TOKEN"

# Cancel booking (requires auth)
curl -X DELETE https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/prod/bookings/ABC123XYZ `
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Database Testing
```powershell
# Connect to RDS
mysql -h your-endpoint.rds.amazonaws.com -u admin -p railway_db

# Common queries
SELECT * FROM trains;
SELECT * FROM train_schedules WHERE travel_date = '2025-11-01';
SELECT * FROM bookings WHERE status = 'CONFIRMED';
```

## 🔍 Monitoring Commands

### CloudWatch Metrics
```powershell
# Get Lambda invocations
aws cloudwatch get-metric-statistics `
  --namespace AWS/Lambda `
  --metric-name Invocations `
  --dimensions Name=FunctionName,Value=BookingFunction `
  --start-time 2025-10-26T00:00:00Z `
  --end-time 2025-10-27T00:00:00Z `
  --period 3600 `
  --statistics Sum

# Get API Gateway latency
aws cloudwatch get-metric-statistics `
  --namespace AWS/ApiGateway `
  --metric-name Latency `
  --start-time 2025-10-26T00:00:00Z `
  --end-time 2025-10-27T00:00:00Z `
  --period 300 `
  --statistics Average
```

### Log Insights Queries
```sql
-- Find booking errors
fields @timestamp, @message
| filter @message like /error|Error|ERROR/
| filter @message like /booking/
| sort @timestamp desc
| limit 100

-- Track successful bookings
fields @timestamp
| filter @message like /Booking confirmed/
| stats count() as successful_bookings by bin(5m)

-- Monitor payment failures
fields @timestamp, @message
| filter @message like /Payment failed/
| parse @message /PNR: (?<pnr>\w+)/
| stats count() by pnr
```

## 🗑️ Cleanup Commands

### Delete All Resources
```powershell
# Delete SAM stack
sam delete --stack-name railway-reservation-system

# Delete S3 bucket
aws s3 rb s3://railway-reservation-frontend --force

# Delete RDS instance
aws rds delete-db-instance `
  --db-instance-identifier railway-db `
  --skip-final-snapshot

# Delete CloudWatch log groups
aws logs delete-log-group --log-group-name /aws/lambda/SearchTrainsFunction
aws logs delete-log-group --log-group-name /aws/lambda/BookingFunction
aws logs delete-log-group --log-group-name /aws/lambda/GetBookingsFunction
aws logs delete-log-group --log-group-name /aws/lambda/CancelBookingFunction
```

## 🔐 Environment Variables

### Backend (.env or SAM parameters)
```
TRAINS_DB_HOST=your-rds-endpoint.rds.amazonaws.com
TRAINS_DB_NAME=railway_db
TRAINS_DB_USER=admin
TRAINS_DB_PASSWORD=YourSecurePassword
SESSIONS_TABLE=railway-sessions
BOOKINGS_TABLE=railway-bookings
SNS_TOPIC_ARN=arn:aws:sns:us-east-1:123456789:railway-booking-notifications
PAYMENT_GATEWAY_ENDPOINT=https://payment-api.example.com
```

### Frontend (.env)
```
VITE_API_ENDPOINT=https://abc123.execute-api.us-east-1.amazonaws.com/prod
VITE_AWS_REGION=us-east-1
VITE_COGNITO_USER_POOL_ID=us-east-1_AbCdEfGhI
VITE_COGNITO_CLIENT_ID=1a2b3c4d5e6f7g8h9i0j
```

## 📊 Useful Queries

### Check Stack Status
```powershell
aws cloudformation describe-stacks --stack-name railway-reservation-system
```

### List Lambda Functions
```powershell
aws lambda list-functions --query 'Functions[?starts_with(FunctionName, `railway`)]'
```

### Get API Gateway Endpoint
```powershell
aws cloudformation describe-stacks `
  --stack-name railway-reservation-system `
  --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' `
  --output text
```

### View DynamoDB Items
```powershell
# Scan bookings table
aws dynamodb scan --table-name railway-bookings --max-items 10
```

## 🎯 Troubleshooting Quick Fixes

### Lambda Function Not Working
```powershell
# Check logs
sam logs -n BookingFunction --tail

# Test locally
sam local invoke BookingFunction -e test-events/booking.json

# Redeploy
sam build && sam deploy
```

### Database Connection Failed
```powershell
# Check RDS status
aws rds describe-db-instances --db-instance-identifier railway-db

# Test connection
mysql -h YOUR-ENDPOINT -u admin -p

# Check security group rules
aws ec2 describe-security-groups --group-ids sg-XXXXXXXX
```

### CORS Issues
- Ensure API Gateway CORS is enabled in `template.yaml`
- Clear browser cache
- Check that API endpoint is correct in frontend `.env`

### Authentication Errors
```powershell
# Verify Cognito user pool
aws cognito-idp describe-user-pool --user-pool-id YOUR_POOL_ID

# Check token expiration (decode JWT at jwt.io)
```

## 📱 Frontend Commands

```powershell
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 💡 Pro Tips

1. **Use SAM local for testing** - Faster than deploying to AWS
2. **Enable CloudWatch Logs Insights** - Better than tail logs
3. **Use DynamoDB for reads** - Faster and cheaper than RDS
4. **Set up alarms early** - Catch issues before users do
5. **Use parameter store** - For sensitive configuration
6. **Tag all resources** - Easier cost tracking
7. **Enable X-Ray** - For distributed tracing
8. **Use Lambda layers** - Share common dependencies
