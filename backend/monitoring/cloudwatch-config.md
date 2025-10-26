# CloudWatch Monitoring Configuration

## Metrics to Monitor

### Lambda Function Metrics
- **Invocations**: Total number of function invocations
- **Duration**: Execution time per invocation
- **Errors**: Number of failed invocations
- **Throttles**: Number of throttled requests
- **ConcurrentExecutions**: Number of concurrent executions

### API Gateway Metrics
- **Count**: Number of API calls
- **Latency**: Time from API Gateway receiving request to returning response
- **4XXError**: Client-side errors
- **5XXError**: Server-side errors

### DynamoDB Metrics
- **ConsumedReadCapacityUnits**: Read capacity consumed
- **ConsumedWriteCapacityUnits**: Write capacity consumed
- **UserErrors**: Requests that generate 4xx error
- **SystemErrors**: Requests that generate 5xx error

### RDS Metrics
- **CPUUtilization**: Percentage of CPU utilization
- **DatabaseConnections**: Number of connections
- **FreeableMemory**: Amount of available RAM
- **ReadLatency/WriteLatency**: Latency for read/write operations

## CloudWatch Alarms

### High Error Rate Alarm
```yaml
AlarmName: HighBookingErrorRate
MetricName: Errors
Namespace: AWS/Lambda
Statistic: Sum
Period: 300
EvaluationPeriods: 1
Threshold: 10
ComparisonOperator: GreaterThanThreshold
```

### High Latency Alarm
```yaml
AlarmName: HighAPILatency
MetricName: Latency
Namespace: AWS/ApiGateway
Statistic: Average
Period: 60
EvaluationPeriods: 2
Threshold: 3000
ComparisonOperator: GreaterThanThreshold
```

### DynamoDB Throttling Alarm
```yaml
AlarmName: DynamoDBThrottling
MetricName: UserErrors
Namespace: AWS/DynamoDB
Statistic: Sum
Period: 60
EvaluationPeriods: 1
Threshold: 5
ComparisonOperator: GreaterThanThreshold
```

## Log Insights Queries

### Search for booking errors
```
fields @timestamp, @message
| filter @message like /error|Error|ERROR/
| filter @message like /booking/
| sort @timestamp desc
| limit 100
```

### Track booking success rate
```
fields @timestamp
| filter @message like /Booking confirmed/
| stats count() as successful_bookings by bin(5m)
```

### Monitor payment failures
```
fields @timestamp, @message
| filter @message like /Payment failed/
| parse @message /PNR: (?<pnr>\w+)/
| stats count() by pnr
```

## Dashboard Configuration

Create a CloudWatch Dashboard with the following widgets:
1. **Booking Success Rate** (line graph)
2. **API Response Times** (line graph)
3. **Error Count by Function** (bar chart)
4. **DynamoDB Read/Write Capacity** (stacked area)
5. **RDS Connection Pool** (number widget)
6. **Recent Errors** (log widget)
