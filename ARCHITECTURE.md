# System Architecture - Logical Flow

This document describes the complete flow matching the architecture diagram provided.

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                                   │
├──────────────────────────────────────────────────────────────────────────┤
│  Browser / Mobile App  →  S3 Webpage Hosting  →  API Gateway Entry Point│
└────────────────────────────────────────────┬─────────────────────────────┘
                                             │
                                             ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                      BUSINESS LOGIC LAYER                                │
├──────────────────────────────────────────────────────────────────────────┤
│                    AWS Lambda (Booking Logic)                            │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ • Check Seat Availability                                          │ │
│  │ • Process Payment                                                  │ │
│  │ • Create Booking                                                   │ │
│  │ • Send Notifications                                               │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└──┬─────────────┬──────────────┬──────────────┬──────────────────────────┘
   │             │              │              │
   ▼             ▼              ▼              ▼
┌─────────┐ ┌─────────┐ ┌──────────────┐ ┌──────────────────────┐
│   RDS   │ │DynamoDB │ │   Payment    │ │  SES/SNS Booking     │
│ Trains &│ │Session/ │ │   Gateway    │ │   Confirmation       │
│ Tickets │ │  Cache  │ │              │ │                      │
│Database │ │         │ │              │ │                      │
└─────────┘ └─────────┘ └──────────────┘ └──────────────────────┘
     │           │              │              │
     └───────────┴──────────────┴──────────────┘
                      │
                      ▼
        ┌──────────────────────────┐
        │  Amazon CloudWatch       │
        │  Monitoring              │
        └──────────────────────────┘
                      │
                      ▼
        ┌──────────────────────────┐
        │  User Sees Ticket /      │
        │  Confirmation            │
        └──────────────────────────┘
```

## Detailed Flow

### 1. User Access Flow
```
User → Browser/Mobile App
  ↓
S3 Static Website Hosting (React Frontend)
  ↓
User performs action (search/book/view bookings)
```

### 2. API Request Flow
```
Frontend makes API call
  ↓
API Gateway Entry Point
  ↓
Cognito Authorization (for protected endpoints)
  ↓
Lambda Function Invocation
```

### 3. Booking Logic Flow

#### Step 1: Search Trains
```
GET /trains/search?from=Delhi&to=Mumbai&date=2025-11-01
  ↓
searchTrains Lambda
  ↓
Query RDS (Trains Database)
  ↓
Return available trains with seats and fares
```

#### Step 2: Create Booking
```
POST /bookings
  ↓
booking Lambda
  ↓
┌─────────────────────────────────────────┐
│ 1. Check DynamoDB Session/Cache         │
│ 2. Verify seat availability (RDS)       │
│ 3. Call Payment Gateway                 │
│ 4. Reserve seats (RDS Transaction)      │
│ 5. Create booking record (RDS)          │
│ 6. Cache booking in DynamoDB            │
│ 7. Send SNS notification                │
│ 8. Send SES email confirmation          │
│ 9. Update CloudWatch metrics            │
└─────────────────────────────────────────┘
  ↓
Return PNR and confirmation
```

#### Step 3: View Bookings
```
GET /bookings
  ↓
getBookings Lambda
  ↓
Query DynamoDB (userId index)
  ↓
Return user's booking list
```

#### Step 4: Cancel Booking
```
DELETE /bookings/{pnr}
  ↓
cancelBooking Lambda
  ↓
┌─────────────────────────────────────────┐
│ 1. Verify ownership (DynamoDB)          │
│ 2. Update booking status (RDS)          │
│ 3. Release seat back (RDS)              │
│ 4. Update DynamoDB cache                │
│ 5. Send cancellation notification       │
└─────────────────────────────────────────┘
  ↓
Return cancellation confirmation
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER ACTIONS                             │
└─────────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
    Search            Book              Manage
    Trains           Ticket            Bookings
        │                 │                 │
        ▼                 ▼                 ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│searchTrains │  │  booking    │  │getBookings/ │
│   Lambda    │  │   Lambda    │  │cancelBooking│
└─────────────┘  └─────────────┘  └─────────────┘
        │                 │                 │
        ▼                 ▼                 ▼
┌─────────────────────────────────────────────────┐
│              DATA PERSISTENCE                   │
├─────────────────────────────────────────────────┤
│  RDS (MySQL)           DynamoDB                 │
│  • trains              • sessions               │
│  • routes              • bookings (cache)       │
│  • schedules                                    │
│  • bookings (master)                            │
└─────────────────────────────────────────────────┘
```

## Component Responsibilities

### Frontend (S3)
- Static React application
- User interface
- Client-side routing
- API calls to backend

### API Gateway
- REST API endpoint
- Request routing
- CORS handling
- Cognito authorization
- Request/response transformation

### AWS Lambda Functions

1. **searchTrains**
   - Query trains from RDS
   - Filter by route and date
   - Return availability and pricing

2. **booking**
   - Validate booking request
   - Check seat availability
   - Process payment
   - Create booking transaction
   - Send notifications
   - Update caches

3. **getBookings**
   - Retrieve user bookings
   - Fast reads from DynamoDB

4. **cancelBooking**
   - Validate cancellation request
   - Update booking status
   - Release seats
   - Send notifications

### Amazon RDS (MySQL)
- **Master data source**
- Trains catalog
- Routes and schedules
- Seat inventory
- Booking records
- ACID transactions

### DynamoDB
- **High-speed cache**
- User sessions (with TTL)
- Booking cache for fast reads
- No-SQL flexibility

### Payment Gateway
- External payment processing
- Transaction handling
- Payment confirmation

### SNS/SES
- Email notifications
- SMS alerts (via SNS)
- Booking confirmations
- Cancellation notices

### CloudWatch
- Lambda logs
- API Gateway metrics
- Database performance
- Error tracking
- Custom dashboards

## Security Flow

```
User Login
  ↓
AWS Cognito Authentication
  ↓
Receive JWT Token
  ↓
Frontend stores token
  ↓
Include token in API requests
  ↓
API Gateway validates token
  ↓
Lambda receives user context
  ↓
Authorize action
```

## Monitoring Flow

```
Every API Call/Lambda Invocation
  ↓
CloudWatch Logs (detailed logging)
  ↓
CloudWatch Metrics (aggregated stats)
  ↓
CloudWatch Alarms (threshold alerts)
  ↓
SNS Notifications (for critical issues)
  ↓
DevOps Team
```

## Cost Optimization Points

1. **DynamoDB**: Pay-per-request pricing for variable loads
2. **Lambda**: Only pay for execution time
3. **API Gateway**: Caching to reduce backend calls
4. **RDS**: T3 instance with auto-scaling storage
5. **S3**: Static hosting (cheapest option)

## Scalability Considerations

- **Lambda**: Auto-scales to handle traffic
- **API Gateway**: Can handle millions of requests
- **DynamoDB**: Auto-scaling read/write capacity
- **RDS**: Read replicas for high read traffic
- **CloudFront**: CDN for global distribution

## Disaster Recovery

- **RDS**: Automated backups + Multi-AZ
- **DynamoDB**: Point-in-time recovery enabled
- **S3**: Versioning enabled
- **Lambda**: Multiple availability zones
- **CloudWatch**: Log retention for auditing
