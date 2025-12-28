# Messaging Blueprint Starter - SMS Composer

## Overview

The Messaging Blueprint Starter provides a comprehensive SMS messaging system that integrates with SlickText's API and plugs directly into existing Auth and Billing starters. This blueprint serves both client-facing messaging tools and internal/white-label messaging layers for automated SMS communication.

## Use Cases

### 1. Client-Facing Messaging Tool

A secure, authenticated dashboard where clients can:

- Draft, preview, schedule, and send SMS campaigns
- Upload and manage contact lists
- View campaign history and delivery statistics
- Set up auto-replies for incoming messages
- Use their own SlickText account credentials

### 2. Internal/White-Label Messaging Layer

A system for sending SMS directly from:

- Websites and web applications
- Point-of-sale (POS) systems
- Automated appointment reminders
- Order updates and notifications
- Without requiring separate SlickText accounts for each client

## Architecture

### Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js/Express API layer (planned)
- **SMS Provider**: SlickText REST API
- **Authentication**: Integrates with existing Auth Blueprint
- **Billing**: Connects with existing Billing Blueprint

### Directory Structure

```
components/blueprints/messaging/
├── index.ts                    # Barrel exports
├── types.ts                    # TypeScript definitions
├── services/
│   └── slicktext.ts           # SlickText API adapter
├── hooks/
│   ├── index.ts               # Hook exports
│   ├── useMessaging.ts        # Main messaging hook
│   ├── useContacts.ts         # Contact management hook
│   └── useCampaigns.ts        # Campaign management hook
├── MessageComposer.tsx        # SMS message composer
├── ContactListUploader.tsx    # CSV contact upload
├── MessagePreviewModal.tsx    # Message preview before sending
├── MessageHistory.tsx         # Campaign history display
├── AutoReplyManager.tsx       # Auto-reply management
└── MessagingDashboard.tsx     # Main dashboard component
```

## Components

### Core Components

#### 1. MessageComposer

**Purpose**: Create and compose SMS messages with character counting and cost estimation.

**Features**:

- Real-time character counting with segment preview
- Unicode detection and cost calculation
- Campaign naming and scheduling
- Contact selection integration
- Draft saving functionality

**Props**:

```typescript
interface MessageComposerProps {
  onSend?: (message: Message, recipients: Contact[]) => void | Promise<void>;
  onSaveDraft?: (message: Message) => void | Promise<void>;
  onSchedule?: (
    message: Message,
    scheduledAt: string,
    recipients: Contact[]
  ) => void | Promise<void>;
  initialMessage?: string;
  maxCharacters?: number;
  className?: string;
}
```

#### 2. ContactListUploader

**Purpose**: Upload and validate contact lists via CSV files.

**Features**:

- Drag-and-drop file upload
- CSV parsing and validation
- Phone number format validation
- Duplicate detection
- Error reporting and preview

**Props**:

```typescript
interface ContactListUploaderProps {
  onUpload?: (contacts: Contact[]) => void | Promise<void>;
  onValidate?: (contacts: Contact[]) => ContactUploadResult;
  maxFileSize?: number;
  allowedFormats?: string[];
  className?: string;
}
```

#### 3. MessagePreviewModal

**Purpose**: Preview SMS messages before sending with recipient details.

**Features**:

- Message content preview
- Recipient list display
- Cost calculation
- Send/schedule actions
- Segment preview for multi-part messages

**Props**:

```typescript
interface MessagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: Message;
  recipients: Contact[];
  onSend?: () => void | Promise<void>;
  onSchedule?: (scheduledAt: string) => void | Promise<void>;
  className?: string;
}
```

#### 4. MessageHistory

**Purpose**: Display past SMS campaigns with delivery statistics.

**Features**:

- Campaign list with status indicators
- Delivery statistics (sent, delivered, failed)
- Campaign actions (view, resend, delete)
- Real-time progress tracking
- Export functionality

**Props**:

```typescript
interface MessageHistoryProps {
  onViewCampaign?: (campaign: Campaign) => void;
  onResend?: (campaign: Campaign) => void;
  onDelete?: (campaign: Campaign) => void;
  className?: string;
}
```

#### 5. AutoReplyManager

**Purpose**: Manage automatic responses to incoming SMS keywords.

**Features**:

- Keyword-based auto-replies
- Enable/disable functionality
- Trigger statistics
- Edit and delete operations

**Props**:

```typescript
interface AutoReplyManagerProps {
  onSave?: (autoReply: AutoReply) => void | Promise<void>;
  onDelete?: (autoReplyId: string) => void | Promise<void>;
  onToggle?: (autoReplyId: string, isActive: boolean) => void | Promise<void>;
  className?: string;
}
```

#### 6. MessagingDashboard

**Purpose**: Main dashboard combining all messaging components.

**Features**:

- Tab-based navigation
- Integrated component management
- Toast notifications
- Configuration management
- Responsive design

**Props**:

```typescript
interface MessagingDashboardProps {
  slickTextConfig?: SlickTextConfig;
  onConfigUpdate?: (config: SlickTextConfig) => void;
  className?: string;
}
```

### Custom Hooks

#### 1. useMessaging

**Purpose**: Main hook for messaging functionality and SlickText integration.

**Features**:

- Send messages via SlickText API
- Upload contacts
- Retrieve message history
- Manage auto-replies
- Configuration management

**Usage**:

```typescript
const {
  isConfigured,
  loading,
  error,
  sendMessage,
  uploadContacts,
  getMessageHistory,
  createAutoReply,
  calculateMessageCost,
} = useMessaging(slickTextConfig);
```

#### 2. useContacts

**Purpose**: Contact list management and validation.

**Features**:

- Contact validation and processing
- Selection management
- Search and filtering
- CSV export functionality
- Statistics calculation

**Usage**:

```typescript
const {
  contacts,
  selectedContacts,
  validateContacts,
  addContacts,
  searchContacts,
  exportContactsToCSV,
} = useContacts();
```

#### 3. useCampaigns

**Purpose**: Campaign management and statistics.

**Features**:

- Campaign creation and updates
- Status management
- Delivery statistics
- Search and filtering
- Export functionality

**Usage**:

```typescript
const {
  campaigns,
  createCampaign,
  updateCampaignStatus,
  getCampaignStats,
  searchCampaigns,
} = useCampaigns();
```

## API Routes & Data Flow

### Planned Backend API Routes

#### Message Management

```
POST /api/messages/send
- Send SMS message batch
- Body: { message, recipients, scheduledAt?, campaignName? }
- Response: { campaignId, messageId, recipientCount, estimatedCost }

GET /api/messages/history
- Fetch campaign history
- Query: { limit?, offset?, status? }
- Response: { campaigns: Campaign[] }

GET /api/messages/:id
- Get specific campaign details
- Response: { campaign: Campaign }
```

#### Contact Management

```
POST /api/contacts/upload
- Upload and validate contacts
- Body: { contacts: Contact[] }
- Response: { successCount, errorCount, errors: ContactUploadError[] }

GET /api/contacts
- Fetch contacts
- Query: { limit?, offset?, search? }
- Response: { contacts: Contact[] }

PUT /api/contacts/:id
- Update contact
- Body: { contact: Partial<Contact> }
- Response: { contact: Contact }
```

#### Auto-Reply Management

```
GET /api/auto-replies
- Fetch auto-replies
- Response: { autoReplies: AutoReply[] }

POST /api/auto-replies
- Create auto-reply
- Body: { keyword, message }
- Response: { autoReply: AutoReply }

PUT /api/auto-replies/:id
- Update auto-reply
- Body: { keyword?, message?, isActive? }
- Response: { autoReply: AutoReply }

DELETE /api/auto-replies/:id
- Delete auto-reply
- Response: { success: boolean }
```

#### Configuration

```
GET /api/config/slicktext
- Get SlickText configuration
- Response: { config: SlickTextConfig }

PUT /api/config/slicktext
- Update SlickText configuration
- Body: { config: SlickTextConfig }
- Response: { success: boolean }
```

### Data Flow

1. **Authentication**: User logs in via Auth Blueprint
2. **Configuration**: SlickText API credentials are configured
3. **Contact Upload**: CSV files are uploaded and validated
4. **Message Composition**: User creates SMS message with recipients
5. **Preview & Send**: Message is previewed and sent via SlickText API
6. **Tracking**: Delivery status is tracked and displayed
7. **Billing**: SMS costs are tracked via Billing Blueprint

## SlickText Integration

### Configuration

```typescript
interface SlickTextConfig {
  apiKey: string; // SlickText API key
  accountId: string; // Account identifier
  baseUrl: string; // API base URL
  sandboxMode: boolean; // Use sandbox for testing
}
```

### Service Adapter

The `SlickTextService` class provides:

- Message sending with segmentation
- Contact upload and management
- Campaign history retrieval
- Auto-reply management
- Webhook processing
- Cost calculation

### SMS Character Limits

- **GSM 7-bit**: 160 characters (153 for concatenated)
- **Unicode**: 70 characters (67 for concatenated)
- **Pricing**: Typically $0.0075 for GSM, $0.015 for Unicode

### Webhook Support

```typescript
interface SlickTextWebhook {
  event:
    | "message.sent"
    | "message.delivered"
    | "message.failed"
    | "contact.opted_in"
    | "contact.opted_out";
  timestamp: string;
  data: {
    messageId: string;
    campaignId?: string;
    phoneNumber: string;
    status?: string;
    error?: string;
  };
}
```

## Authentication Integration

### With Auth Blueprint

The messaging system integrates seamlessly with the existing Auth Blueprint:

```typescript
// User context from Auth Blueprint
const { user, isAuthenticated } = useAuth();

// Only show messaging dashboard if authenticated
if (!isAuthenticated) {
  return <LoginForm />;
}

return <MessagingDashboard />;
```

### User Permissions

- **Standard Users**: Can send messages, manage contacts, view history
- **Admin Users**: Can configure SlickText settings, manage auto-replies
- **Billing Integration**: SMS costs are tracked per user/organization

## Billing Integration

### Cost Tracking

- Real-time SMS cost calculation
- Per-message cost tracking
- Monthly usage statistics
- Credit balance monitoring

### Billing Blueprint Integration

```typescript
// Track SMS usage in billing system
const { updateUsage } = useBilling();

const handleSendMessage = async (message, recipients) => {
  const cost = calculateMessageCost(message, recipients.length);
  await updateUsage("sms", cost, "USD");
  // ... send message
};
```

## Future Automation Hooks

### Webhook Triggers

```typescript
// Automated message sending based on events
const useAutomatedMessaging = () => {
  const sendAppointmentReminder = async (appointment) => {
    const message = `Reminder: Your appointment is tomorrow at ${appointment.time}`;
    await sendMessage(message, [appointment.contact]);
  };

  const sendOrderUpdate = async (order) => {
    const message = `Your order #${order.id} has been shipped. Tracking: ${order.tracking}`;
    await sendMessage(message, [order.customer]);
  };

  return { sendAppointmentReminder, sendOrderUpdate };
};
```

### Scheduled Messages

- Integration with cron jobs or scheduled tasks
- Bulk message scheduling
- Recurring campaign management
- Time zone handling

### Event-Driven Messaging

- Database triggers for automated messages
- API webhooks for external system integration
- Real-time event processing
- Message queue management

## Usage Examples

### Basic Dashboard Integration

```typescript
import { MessagingDashboard } from "@ffx/components/blueprints/messaging";

function App() {
  const slickTextConfig = {
    apiKey: process.env.REACT_APP_SLICKTEXT_API_KEY,
    accountId: process.env.REACT_APP_SLICKTEXT_ACCOUNT_ID,
    baseUrl: "https://api.slicktext.com/v1",
    sandboxMode: process.env.NODE_ENV !== "production",
  };

  return (
    <MessagingDashboard
      slickTextConfig={slickTextConfig}
      onConfigUpdate={(config) => {
        // Save configuration to backend
        updateSlickTextConfig(config);
      }}
    />
  );
}
```

### Standalone Message Sending

```typescript
import { useMessaging } from "@ffx/components/blueprints/messaging/hooks";

function OrderNotification() {
  const { sendMessage, isConfigured } = useMessaging(slickTextConfig);

  const notifyOrderShipped = async (order) => {
    if (!isConfigured) return;

    const message = `Your order #${order.id} has shipped! Tracking: ${order.tracking}`;
    await sendMessage(message, [order.customer.phone]);
  };

  return (
    <button onClick={() => notifyOrderShipped(order)}>
      Send Shipping Notification
    </button>
  );
}
```

### Contact Management

```typescript
import { useContacts } from "@ffx/components/blueprints/messaging/hooks";

function ContactManager() {
  const {
    contacts,
    selectedContacts,
    validateContacts,
    addContacts,
    downloadContactsCSV,
  } = useContacts();

  const handleFileUpload = (file) => {
    const contacts = parseCSV(file);
    const result = validateContacts(contacts);
    if (result.success) {
      addContacts(result.validContacts);
    }
  };

  return (
    <div>
      <ContactListUploader onUpload={handleFileUpload} />
      <button onClick={() => downloadContactsCSV()}>Export Contacts</button>
    </div>
  );
}
```

## Environment Variables

### Required

```bash
REACT_APP_SLICKTEXT_API_KEY=your_api_key
REACT_APP_SLICKTEXT_ACCOUNT_ID=your_account_id
REACT_APP_SLICKTEXT_BASE_URL=https://api.slicktext.com/v1
```

### Optional

```bash
REACT_APP_SLICKTEXT_SANDBOX=true
REACT_APP_SMS_DEFAULT_CURRENCY=USD
REACT_APP_MAX_FILE_SIZE_MB=5
```

## Testing

### SlickText Sandbox

- Use sandbox mode for development and testing
- Test with sandbox phone numbers
- Verify webhook delivery
- Test auto-reply functionality

### Component Testing

```typescript
import { render, screen } from "@testing-library/react";
import { MessagingDashboard } from "@ffx/components/blueprints/messaging";

test("renders messaging dashboard", () => {
  render(<MessagingDashboard />);
  expect(screen.getByText("SMS Messaging Dashboard")).toBeInTheDocument();
});
```

## Deployment

### Production Checklist

- [ ] Configure production SlickText API credentials
- [ ] Set up webhook endpoints for delivery status
- [ ] Configure billing integration
- [ ] Set up monitoring and logging
- [ ] Test with real phone numbers
- [ ] Configure rate limiting
- [ ] Set up backup and recovery

### Security Considerations

- Store API keys securely (environment variables)
- Validate all user inputs
- Implement rate limiting
- Use HTTPS for all API calls
- Log all messaging activities
- Implement user permissions

## Troubleshooting

### Common Issues

#### 1. API Configuration Errors

- Verify API key and account ID
- Check sandbox vs production mode
- Ensure proper base URL configuration

#### 2. Message Delivery Issues

- Check phone number format
- Verify opt-in status
- Review SlickText account balance
- Check for content violations

#### 3. Contact Upload Errors

- Validate CSV format
- Check phone number formats
- Remove duplicates
- Verify file size limits

#### 4. Billing Integration Issues

- Verify billing configuration
- Check cost calculation accuracy
- Ensure proper currency handling
- Monitor usage limits

## Support

For issues and questions:

1. Check the troubleshooting section
2. Review SlickText API documentation
3. Check component documentation
4. Contact development team

## License

This messaging blueprint is part of the Flying Fox Solutions template library and follows the same licensing terms.
