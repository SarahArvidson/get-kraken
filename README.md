# 🎿 Kibblings

A mobile-first habit-tracker and rewards webapp for two people sharing a wallet. Complete repeatable real-world quests to earn kibblings (bronze coin emojis 🟡) and spend them in a customizable shop. Built to help save for a March ski trip while getting ski-fit together.

## Features

- **Shared Wallet**: Real-time synchronized wallet with live total display
- **Quest System**: Complete repeatable quests to earn kibblings
- **Customizable Shop**: Purchase items with editable prices
- **Swipeable Logs**: View chronological history of completions and purchases
- **Gamification**:
  - Daily streaks per quest
  - Weekly recap showing earned, spent, and net progress
  - Milestone celebrations at 100, 250, 500+ kibblings
  - Shared ski trip fund progress indicator
- **Mobile-First**: Optimized for Galaxy S25 Ultra and desktop
- **Real-Time Sync**: All data synced across devices via Supabase

## Tech Stack

- **React 19** with TypeScript
- **@ffx/sdk** - Flying Fox SDK for components, hooks, and integrations
- **Supabase** - Database, storage, and real-time sync
- **Tailwind CSS** - Styling
- **Vite** - Build tool

## Setup

### Prerequisites

- Node.js 18+ and npm
- A Supabase project (free tier works)

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up Supabase:

   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL schema from `supabase-schema.sql` in your Supabase SQL editor
   - Create a storage bucket named `kibblings` (public access)
   - Get your project URL and anon key from Settings > API

4. Configure environment variables:

   - Copy `.env.example` to `.env`
   - Fill in your Supabase credentials:
     ```
     VITE_SUPABASE_URL=https://your-project-id.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key-here
     ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Database Schema

The app uses the following Supabase tables:

- `wallets` - Single shared wallet with total balance
- `quests` - Quest definitions with name, photo, reward, and completion count
- `quest_logs` - Log of quest completions with timestamps
- `shop_items` - Shop item definitions with name, photo, price, and purchase count
- `shop_logs` - Log of item purchases with timestamps

See `supabase-schema.sql` for the complete schema.

## Usage

### Creating Quests

1. Tap the "Add New Quest" card
2. Enter quest name, set reward amount, and optionally upload a photo
3. Tap "Create Quest"

### Completing Quests

1. Tap "Complete Quest" on any quest card
2. Kibblings are added to the wallet immediately
3. Completion is logged with timestamp

### Creating Shop Items

1. Tap the "Add Shop Item" card
2. Enter item name, set price, and optionally upload a photo
3. Tap "Create Item"

### Purchasing Items

1. Tap "Purchase" on any shop item card
2. Kibblings are deducted from the wallet (can go negative)
3. Purchase is logged with timestamp

### Viewing Logs

1. Tap "Logs" on any quest or shop item card
2. Swipe left/right to navigate through chronological history

### Editing

- Use the +/- controls on quest cards to adjust rewards
- Use the +/- controls on shop item cards to adjust prices
- Changes sync in real-time across devices

## Project Structure

```
src/
├── components/          # UI components
│   ├── QuestCard.tsx
│   ├── ShopItemCard.tsx
│   ├── WalletDisplay.tsx
│   ├── LogView.tsx
│   ├── AddQuestCard.tsx
│   ├── AddShopItemCard.tsx
│   └── GamificationPanel.tsx
├── hooks/              # Custom hooks
│   ├── useWallet.ts
│   ├── useQuests.ts
│   ├── useShopItems.ts
│   └── useGamification.ts
├── lib/                # Utilities
│   └── supabase.ts     # Supabase integration
├── types.ts            # TypeScript types
├── App.tsx             # Main app component
└── main.tsx            # Entry point
```

## SDK Requirements

This project strictly uses components, hooks, blueprints, and integrations from `@ffx/sdk`. All UI components (Button, InputField, Modal, Toast, etc.) are imported from the SDK. The Supabase integration is also from the SDK.

**Important**: Do not recreate SDK functionality locally. If a feature is missing, request permission to extend the SDK instead.

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

## License

Private project
