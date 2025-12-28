# Consulting Site Starter

A complete SaaS-style web application template that demonstrates how to build a consulting site using the Flying Fox Template Library's atomic components and blueprints.

## Overview

The Consulting Site Starter is a comprehensive archetype that showcases how to compose atomic components into a full-featured business application. It's designed for small businesses like marketing agencies, event planners, outdoor schools, or any consulting firm that needs a customer portal or internal dashboard.

## Features

### 🏗️ **Complete Application Structure**

- Responsive sidebar navigation with collapsible menu
- Top header with user menu and notifications
- Footer with company information and links
- Mobile-responsive design with overlay navigation

### 📊 **Dashboard Page**

- Overview statistics cards (users, revenue, orders, growth metrics)
- Recent activity feed with different activity types
- Quick action buttons for common tasks
- Real-time data visualization

### 💬 **Messaging Integration**

- Full Messaging Dashboard blueprint integration
- SMS campaign management
- Contact list management
- Message history and analytics
- Template management
- Auto-reply configuration

### 💳 **Billing & Subscriptions**

- Billing Dashboard blueprint integration
- Current plan status and billing information
- Plan upgrade/downgrade interface
- Checkout flow integration
- Payment method management

### 🛒 **POS / Orders**

- POS Dashboard blueprint integration
- Order management interface
- Product catalog integration
- Recent orders list
- Daily statistics
- Quick action buttons

### ⚙️ **Settings & Preferences**

- User profile management
- Theme and appearance preferences
- Notification settings
- Integration management
- Account deletion functionality

## Architecture

### Component Structure

```
components/blueprints/consulting-site/
├── ConsultingSite.tsx          # Main application component
├── types.ts                    # TypeScript type definitions
├── layout/
│   ├── Layout.tsx              # Main layout wrapper
│   ├── Sidebar.tsx             # Navigation sidebar
│   ├── Header.tsx              # Top header with user menu
│   └── index.ts                # Layout barrel export
├── pages/
│   ├── Dashboard.tsx           # Dashboard page
│   ├── MessagingPage.tsx       # Messaging integration page
│   ├── BillingPage.tsx         # Billing management page
│   ├── POSPage.tsx             # POS/Orders page
│   ├── SettingsPage.tsx        # Settings and preferences page
│   └── index.ts                # Pages barrel export
└── index.ts                    # Main barrel export
```

### Key Components

#### `ConsultingSite`

The main application component that orchestrates the entire consulting site experience.

**Props:**

```typescript
interface ConsultingSiteProps {
  config: ConsultingSiteConfig;
  user?: User;
  onUserUpdate?: (user: User) => void;
  onConfigUpdate?: (config: ConsultingSiteConfig) => void;
}
```

#### `Layout`

Responsive layout component that provides the application shell.

**Features:**

- Collapsible sidebar navigation
- Top header with user menu
- Mobile-responsive design
- Footer with company information

#### `Dashboard`

Main dashboard page with business metrics and activity feed.

**Features:**

- Statistics cards with growth indicators
- Recent activity timeline
- Quick action buttons
- Responsive grid layout

## Usage

### Basic Implementation

```tsx
import React from "react";
import { ConsultingSite } from "@ffx/blueprints";

const config = {
  features: {
    messaging: true,
    billing: true,
    pos: true,
    analytics: true,
  },
  integrations: {
    slicktext: {
      enabled: true,
      apiKey: "your_api_key",
    },
    stripe: {
      enabled: true,
      publicKey: "your_public_key",
    },
  },
  branding: {
    companyName: "Your Consulting Firm",
    primaryColor: "#4F46E5",
    secondaryColor: "#06B6D4",
  },
};

const App = () => {
  return (
    <ConsultingSite
      config={config}
      user={{
        id: "user_123",
        email: "user@example.com",
        firstName: "John",
        lastName: "Doe",
        role: "admin",
        isActive: true,
      }}
      onUserUpdate={(user) => console.log("User updated:", user)}
      onConfigUpdate={(config) => console.log("Config updated:", config)}
    />
  );
};
```

### Custom Configuration

The consulting site can be customized through the configuration object:

```typescript
interface ConsultingSiteConfig {
  features: {
    messaging: boolean;
    billing: boolean;
    pos: boolean;
    analytics: boolean;
  };
  integrations: {
    slicktext?: {
      enabled: boolean;
      apiKey?: string;
    };
    stripe?: {
      enabled: boolean;
      publicKey?: string;
    };
    square?: {
      enabled: boolean;
      applicationId?: string;
    };
  };
  branding: {
    companyName: string;
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
  };
}
```

### Navigation Customization

The navigation can be customized by providing a custom `NavigationConfig`:

```typescript
const customNavigation = {
  brand: {
    name: "Your Company",
    href: "/",
  },
  items: [
    {
      id: "dashboard",
      label: "Dashboard",
      href: "/dashboard",
      icon: "📊",
    },
    // Add more navigation items
  ],
  userMenu: {
    profile: { id: "profile", label: "Profile", href: "/profile" },
    settings: { id: "settings", label: "Settings", href: "/settings" },
    logout: { id: "logout", label: "Sign Out", href: "/logout" },
  },
};
```

## Integration with Blueprints

The consulting site demonstrates how to integrate multiple blueprints:

### Messaging Blueprint

```tsx
<MessagingDashboard
  slickTextConfig={slickTextConfig}
  onConfigUpdate={handleConfigUpdate}
/>
```

### Billing Blueprint

```tsx
<BillingDashboard />
<CheckoutPanel
  plans={mockPlans}
  currency="$"
  onCheckout={handleCheckout}
/>
```

### POS Blueprint

```tsx
<POSDashboard onCheckout={handleCheckout} />
```

## Styling and Theming

The consulting site uses Tailwind CSS with dark mode support:

- **Light Mode**: Clean, professional appearance with subtle shadows
- **Dark Mode**: Dark backgrounds with proper contrast ratios
- **Responsive**: Mobile-first design that works on all screen sizes
- **Accessible**: Proper ARIA labels and keyboard navigation

### Custom Styling

Components can be styled using the `className` prop:

```tsx
<ConsultingSite config={config} className="custom-consulting-site" />
```

## Data Management

### Mock Data

The consulting site includes comprehensive mock data for demonstration:

- **User Data**: Sample user profiles and preferences
- **Statistics**: Business metrics and growth indicators
- **Activity**: Recent user actions and system events
- **Orders**: Sample order history and processing data

### Real Data Integration

To connect to real data sources:

1. Replace mock data with API calls
2. Implement proper state management (Redux, Zustand, etc.)
3. Add loading states and error handling
4. Implement real-time updates with WebSockets

## Routing Integration

While the demo uses simple state-based routing, the consulting site is designed to work with any routing library:

### React Router

```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

const App = () => (
  <BrowserRouter>
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/messaging" element={<MessagingPage />} />
        <Route path="/billing" element={<BillingPage />} />
        <Route path="/pos" element={<POSPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Layout>
  </BrowserRouter>
);
```

### Next.js

```tsx
// pages/_app.tsx
import { ConsultingSite } from "@ffx/blueprints";

export default function MyApp({ Component, pageProps }) {
  return (
    <ConsultingSite config={config}>
      <Component {...pageProps} />
    </ConsultingSite>
  );
}
```

## Authentication Integration

The consulting site is designed to work with any authentication system:

### Auth0

```tsx
import { useAuth0 } from "@auth0/auth0-react";

const ConsultingSiteWithAuth = () => {
  const { user, isAuthenticated, loginWithRedirect } = useAuth0();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <button onClick={() => loginWithRedirect()}>Login</button>
      </div>
    );
  }

  return (
    <ConsultingSite
      config={config}
      user={{
        id: user.sub,
        email: user.email,
        firstName: user.given_name,
        lastName: user.family_name,
        role: "user",
        isActive: true,
      }}
    />
  );
};
```

### Firebase Auth

```tsx
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";

const ConsultingSiteWithFirebase = () => {
  const [user, loading, error] = useAuthState(auth);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return <div>Please log in</div>;

  return (
    <ConsultingSite
      config={config}
      user={{
        id: user.uid,
        email: user.email,
        firstName: user.displayName?.split(" ")[0] || "",
        lastName: user.displayName?.split(" ")[1] || "",
        role: "user",
        isActive: true,
      }}
    />
  );
};
```

## Performance Considerations

### Code Splitting

```tsx
import { lazy, Suspense } from "react";

const MessagingPage = lazy(() => import("./pages/MessagingPage"));
const BillingPage = lazy(() => import("./pages/BillingPage"));

const App = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <ConsultingSite config={config}>{/* Routes */}</ConsultingSite>
  </Suspense>
);
```

### Bundle Optimization

- Components are tree-shakeable
- Only import what you need
- Use dynamic imports for large blueprints
- Consider lazy loading for less frequently used pages

## Accessibility

The consulting site follows WCAG 2.1 AA guidelines:

- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Screen Reader Support**: Proper ARIA labels and roles
- **Color Contrast**: Meets minimum contrast ratios
- **Focus Management**: Clear focus indicators and logical tab order

### ARIA Implementation

```tsx
<nav aria-label="Main navigation">
  <ul role="menubar">
    <li role="none">
      <a role="menuitem" href="/dashboard">
        Dashboard
      </a>
    </li>
  </ul>
</nav>
```

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Progressive Enhancement**: Graceful degradation for older browsers

## Deployment

### Build Process

```bash
npm run build
```

### Environment Variables

```env
REACT_APP_API_URL=https://api.yourapp.com
REACT_APP_SLICKTEXT_API_KEY=your_api_key
REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_key
```

### Docker Deployment

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Examples

See the `examples/` directory for complete implementation examples:

- `Consulting-Site-Starter-Example.tsx` - Basic usage example
- Integration examples with popular authentication providers
- Custom styling and theming examples
- Real-world deployment configurations

## Support

For questions, issues, or contributions:

- **Documentation**: [Flying Fox Solutions Docs](https://docs.flyingfox.com)
- **GitHub Issues**: [Report bugs or request features](https://github.com/flyingfox/templates/issues)
- **Discord**: [Community support](https://discord.gg/flyingfox)

## License

This consulting site starter is part of the Flying Fox Template Library and is available under the MIT License.
