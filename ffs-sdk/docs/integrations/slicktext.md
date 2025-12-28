# SlickText API v2 Integration Guide

## Overview

This document provides a comprehensive guide for integrating with SlickText's API v2 for SMS messaging functionality. The integration supports all core messaging features including sending messages, managing contacts, creating campaigns, and handling webhooks.

## API v2 Key Changes

### Authentication

- **New Method**: HTTP Basic Authentication using `public_key:private_key`
- **Old Method**: Single API key (deprecated in v2)
- **Security**: Enhanced security with separate public/private key pairs

### Base URL

- **API v2**: `https://dev.slicktext.com/v1` (Note: SlickText uses v1 in the URL for their v2 API)
- **Environment**: Sandbox and production endpoints available

### Endpoint Structure

- **Messages**: `/messages` - Send and manage SMS messages
- **Lists**: `/lists` - Manage subscriber lists
- **Subscribers**: `/subscribers` - Individual contact management
- **Campaigns**: `/campaigns` - Campaign creation and statistics
- **Auto-replies**: `/auto-replies` - Automated response management

## Configuration

### Environment Variables

Create a `.env` file in your backend directory with the following variables:

```bash
# SlickText API v2 Configuration
SLICKTEXT_PUBLIC_KEY=your_slicktext_public_key
SLICKTEXT_PRIVATE_KEY=your_slicktext_private_key
SLICKTEXT_BRAND_ID=your_slicktext_brand_id
SLICKTEXT_BASE_URL=https://dev.slicktext.com/v1
SLICKTEXT_ENVIRONMENT=sandbox
```

### Security Best Practices

1. **Never commit API keys to version control**
2. **Use environment variables for all credentials**
3. **Rotate keys regularly**
4. **Use sandbox environment for development**
5. **Implement webhook signature verification**

## Core Integration Functions

### 1. Send Message

Send SMS messages to a list or individual recipients.

```typescript
// Send to a specific list
const result = await slicktextService.sendMessage(
  'list_id_123',
  'Hello from our app!',
  new Date('2024-01-15T10:00:00Z') // Optional scheduled time
);

// Response
{
  success: true,
  data: {
    id: 'msg_123',
    status: 'queued',
    scheduled_for: '2024-01-15T10:00:00Z',
    list_id: 'list_id_123'
  }
}
```

### 2. Subscribe Contact

Add a contact to a specific list.

```typescript
const result = await slicktextService.subscribeContact(
  'list_id_123',
  '+1234567890',
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    customField1: 'value1'
  }
);

// Response
{
  success: true,
  data: {
    id: 'sub_123',
    phone: '+1234567890',
    list_id: 'list_id_123',
    status: 'active'
  }
}
```

### 3. Get Campaign Statistics

Retrieve detailed statistics for a campaign.

```typescript
const result = await slicktextService.getCampaignStats('campaign_123');

// Response
{
  success: true,
  data: {
    id: 'campaign_123',
    name: 'Welcome Campaign',
    sent: 150,
    delivered: 148,
    failed: 2,
    opened: 45,
    clicked: 12,
    unsubscribed: 1
  }
}
```

### 4. Get Lists

Retrieve all available lists.

```typescript
const result = await slicktextService.getLists();

// Response
{
  success: true,
  data: [
    {
      id: 'list_123',
      name: 'Main Subscribers',
      subscriber_count: 150,
      created_at: '2024-01-01T00:00:00Z'
    }
  ]
}
```

### 5. Delete Subscriber

Remove a subscriber from a list.

```typescript
const result = await slicktextService.deleteSubscriber('subscriber_123');

// Response
{
  success: true,
  data: {
    id: 'subscriber_123',
    status: 'deleted'
  }
}
```

## API Endpoints

### Backend Routes

All routes are prefixed with `/api/messaging/` and require authentication.

| Method | Endpoint               | Description               |
| ------ | ---------------------- | ------------------------- |
| POST   | `/send`                | Send SMS message          |
| GET    | `/campaigns/:id/stats` | Get campaign statistics   |
| GET    | `/messages/history`    | Get message history       |
| GET    | `/lists`               | Get all lists             |
| POST   | `/contacts/subscribe`  | Subscribe contact to list |
| GET    | `/contacts`            | Get contacts              |
| DELETE | `/contacts/:id`        | Delete subscriber         |
| POST   | `/auto-replies`        | Create auto-reply         |
| GET    | `/auto-replies`        | Get auto-replies          |
| GET    | `/account/balance`     | Get account balance       |
| POST   | `/webhooks/slicktext`  | Handle webhooks           |

### Request Examples

#### Send Message

```http
POST /api/messaging/send
Content-Type: application/json
Authorization: Bearer your_jwt_token

{
  "content": "Hello from our app!",
  "listId": "list_123",
  "campaignName": "Welcome Campaign",
  "scheduledFor": "2024-01-15T10:00:00Z"
}
```

#### Subscribe Contact

```http
POST /api/messaging/contacts/subscribe
Content-Type: application/json
Authorization: Bearer your_jwt_token

{
  "listId": "list_123",
  "phone": "+1234567890",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "customFields": {
    "source": "website",
    "interests": "newsletter"
  }
}
```

#### Get Campaign Stats

```http
GET /api/messaging/campaigns/campaign_123/stats
Authorization: Bearer your_jwt_token
```

## Error Handling

### Common Error Responses

```typescript
// Authentication Error
{
  success: false,
  error: {
    code: 'AUTHENTICATION_FAILED',
    message: 'Invalid API credentials',
    status: 401
  }
}

// Validation Error
{
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Phone number is required',
    status: 400
  }
}

// Rate Limit Error
{
  success: false,
  error: {
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests',
    status: 429
  }
}
```

### Error Handling Best Practices

1. **Always check the `success` field**
2. **Handle rate limiting with exponential backoff**
3. **Log errors for debugging**
4. **Implement retry logic for transient failures**
5. **Validate input before making API calls**

## Webhook Integration

### Webhook Verification

All webhooks include a signature for verification:

```typescript
const signature = req.headers["x-slicktext-signature"];
const payload = JSON.stringify(req.body);
const isValid = await slicktextService.verifyWebhook(payload, signature);
```

### Webhook Events

Common webhook events include:

- `message.delivered` - Message successfully delivered
- `message.failed` - Message delivery failed
- `subscriber.opted_out` - Subscriber unsubscribed
- `subscriber.opted_in` - New subscriber added

### Webhook Processing

```typescript
// Process incoming webhook
const result = await slicktextService.processWebhook(req.body);

if (result.success) {
  // Update local database, send notifications, etc.
  console.log("Webhook processed:", result.data);
} else {
  console.error("Webhook processing failed:", result.error);
}
```

## Frontend Integration

### React Hook Example

```typescript
import { useMessaging } from "@ffx/sdk/hooks";

function MyComponent() {
  const { sendMessage, subscribeContact, loading, error } = useMessaging();

  const handleSendMessage = async () => {
    const result = await sendMessage({
      listId: "list_123",
      content: "Hello World!",
    });

    if (result.success) {
      console.log("Message sent:", result.data);
    }
  };

  return (
    <button onClick={handleSendMessage} disabled={loading}>
      Send Message
    </button>
  );
}
```

### Service Usage

```typescript
import { SlickTextIntegration } from "@ffx/sdk/services";

// Configure the service (placeholder - SlickText integration not yet implemented)
const slicktext = new SlickTextIntegration({
  publicKey: process.env.REACT_APP_SLICKTEXT_PUBLIC_KEY!,
  privateKey: process.env.REACT_APP_SLICKTEXT_PRIVATE_KEY!,
  brandId: process.env.REACT_APP_SLICKTEXT_BRAND_ID!,
  baseUrl: process.env.REACT_APP_SLICKTEXT_BASE_URL!,
  sandboxMode: process.env.NODE_ENV !== "production",
});

// Use the service (will be available when SlickText integration is implemented)
// const result = await slicktext.sendMessage("list_123", "Hello!");
```

## Testing

### Mock Testing System

The SlickText integration includes a comprehensive mock testing system that allows you to test all functionality without hitting the live API.

#### Environment Configuration

Set the `USE_MOCKS` environment variable to enable mock mode:

```bash
# Enable mock mode for testing
USE_MOCKS=true

# Or disable for real API calls
USE_MOCKS=false
```

#### Mock Service Features

The mock service provides:

- **Realistic data**: Mock responses that match real API v2 structure
- **Error simulation**: Test error handling scenarios
- **Performance testing**: Simulate network delays and concurrent requests
- **Webhook testing**: Mock webhook events and processing

#### Running Mock Tests

```bash
# Run all tests
npm test

# Run only SlickText tests
npm run test:slicktext

# Run tests in watch mode
npm run test:slicktext:watch

# Run tests with coverage
npm run test:coverage
```

#### Test API Endpoints

The backend includes test endpoints for manual testing:

```bash
# Get service status
GET /api/test/slicktext/status

# Switch to mock mode
POST /api/test/slicktext/mode
{ "mode": "mock" }

# Test sending a message
POST /api/test/slicktext/send
{
  "listId": "list_123456789",
  "content": "Test message"
}

# Test subscribing a contact
POST /api/test/slicktext/subscribe
{
  "listId": "list_123456789",
  "phone": "+1234567890",
  "firstName": "Test",
  "lastName": "User"
}

# Test complete workflow
POST /api/test/slicktext/workflow
```

#### Mock Data Examples

The mock system includes realistic test data:

```typescript
// Mock lists
const mockLists = [
  {
    id: "list_123456789",
    name: "Main Subscribers",
    subscriber_count: 1250,
  },
];

// Mock contacts
const mockContacts = [
  {
    id: "contact_111222333",
    phone: "+1234567890",
    first_name: "John",
    last_name: "Doe",
    list_id: "list_123456789",
  },
];

// Mock campaigns with statistics
const mockCampaigns = [
  {
    id: "camp_111222333",
    name: "Welcome Campaign",
    sent_count: 1250,
    delivered_count: 1198,
    failed_count: 52,
    opened_count: 456,
    clicked_count: 89,
  },
];
```

### Sandbox Environment

Use the sandbox environment for development and testing:

```bash
SLICKTEXT_ENVIRONMENT=sandbox
SLICKTEXT_BASE_URL=https://dev.slicktext.com/v1
```

### Test Credentials

SlickText provides test credentials for sandbox testing. Contact SlickText support to obtain sandbox API keys.

### Example Test Flow

```typescript
// 1. Create a test list
const listResult = await slicktextService.getLists();

// 2. Subscribe a test contact
const subscribeResult = await slicktextService.subscribeContact(
  listResult.data[0].id,
  "+1234567890",
  { firstName: "Test", lastName: "User" }
);

// 3. Send a test message
const messageResult = await slicktextService.sendMessage(
  listResult.data[0].id,
  "Test message from integration"
);

// 4. Check campaign stats
const statsResult = await slicktextService.getCampaignStats(
  messageResult.data.campaign_id
);
```

## Migration from API v1

### Key Changes Required

1. **Update authentication** from single API key to public/private key pair
2. **Change base URL** to the new v2 endpoint
3. **Update endpoint paths** to match v2 structure
4. **Modify request/response handling** for new data formats
5. **Update webhook verification** for new signature format

### Migration Checklist

- [ ] Update environment variables
- [ ] Replace authentication method
- [ ] Update all API calls
- [ ] Test webhook handling
- [ ] Update error handling
- [ ] Verify all functionality works

## Troubleshooting

### Common Issues

1. **Authentication Failures**

   - Verify public/private key pair
   - Check environment variable names
   - Ensure keys are not URL-encoded

2. **Message Delivery Issues**

   - Verify list ID exists
   - Check phone number format
   - Ensure sufficient account balance

3. **Webhook Problems**
   - Verify signature calculation
   - Check webhook URL accessibility
   - Ensure proper error handling

### Debug Mode

Enable debug logging for troubleshooting:

```typescript
slicktextService.configure({
  // ... other config
  debug: true,
});
```

### Support Resources

- SlickText API Documentation: [Official Docs]
- SlickText Support: [Support Contact]
- Integration Examples: [GitHub Repository]

## Security Considerations

### API Key Management

1. **Store keys securely** using environment variables
2. **Never expose keys** in client-side code
3. **Use different keys** for development and production
4. **Rotate keys regularly**

### Webhook Security

1. **Always verify signatures** before processing webhooks
2. **Use HTTPS** for webhook endpoints
3. **Implement rate limiting** on webhook handlers
4. **Log all webhook events** for audit purposes

### Data Privacy

1. **Minimize data collection** to what's necessary
2. **Encrypt sensitive data** in transit and at rest
3. **Implement proper access controls**
4. **Follow GDPR/CCPA compliance** requirements

## Performance Optimization

### Rate Limiting

SlickText API v2 has rate limits. Implement proper throttling:

```typescript
// Example rate limiting implementation
const rateLimiter = new Map();

async function makeApiCall(endpoint: string, data: unknown) {
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 100; // per minute

  const requests = rateLimiter.get(endpoint) || [];
  const recentRequests = requests.filter(
    (time: number) => now - time < windowMs
  );

  if (recentRequests.length >= maxRequests) {
    throw new Error("Rate limit exceeded");
  }

  rateLimiter.set(endpoint, [...recentRequests, now]);

  // Make the actual API call
  return await slicktextService.makeApiCall(endpoint, data);
}
```

### Caching

Implement caching for frequently accessed data:

```typescript
// Cache lists for 5 minutes
const listCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getLists() {
  const cacheKey = "lists";
  const cached = listCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const result = await slicktextService.getLists();
  listCache.set(cacheKey, {
    data: result,
    timestamp: Date.now(),
  });

  return result;
}
```

## Conclusion

This integration provides a robust foundation for SMS messaging functionality using SlickText API v2. The modular design allows for easy customization and extension based on specific business needs.

For additional support or questions about the integration, please refer to the SlickText documentation or contact the development team.
