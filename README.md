# 🎯 SlotWise

**A vertical-specific booking & scheduling SaaS for niche service professionals**

SlotWise is not just another calendar app. It's a complete business operations tool designed specifically for service professionals who need deposits, no-show protection, client management, intake forms, and waivers—all out of the box.

## 🎨 Features at a Glance

- ✅ **Profession-Specific Setup** - Tailored experiences for tattoo artists, dog groomers, music teachers, and mobile beauty professionals
- ✅ **Smart Booking & Scheduling** - Calendar with week/day/month views, time slot management, and availability control
- ✅ **Deposit Collection** - Built-in Stripe integration for upfront payments and deposit protection
- ✅ **No-Show Protection** - Automatic flagging and follow-up when clients don't show
- ✅ **Client CRM** - Track client history, loyalty, and intake form responses
- ✅ **Intake Forms & Waivers** - Drag-and-drop form builder with digital signature support
- ✅ **Multi-Channel Reminders** - Automatic email & SMS reminders (48h, 24h, 2h before)
- ✅ **Analytics Dashboard** - Revenue tracking, booking stats, client metrics, and heatmaps
- ✅ **Public Booking Page** - Clients can book without creating an account
- ✅ **Team Management** - Assign services to staff (Studio plan)
- ✅ **Mobile-First Design** - Fully responsive, optimized for mobile booking

## 🏗️ Tech Stack

- **Frontend:** Next.js 14 (App Router) with TypeScript
- **Database & Auth:** Supabase + PostgreSQL
- **Payments:** Stripe (subscriptions & deposits)
- **Notifications:** Resend (Email) + Twilio (SMS)
- **UI Framework:** Tailwind CSS + Radix UI
- **Hosting:** Vercel
- **Languages:** TypeScript (90.9%), JavaScript (6.1%), PL/pgSQL (2.8%)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm/yarn/pnpm/bun
- Supabase account
- Stripe account
- Resend account
- Twilio account

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/ChiragThakur03/SlotWise.git
cd SlotWise
```

2. **Install dependencies:**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up environment variables:**
```bash
cp .env.local.example .env.local
```

Then fill in your credentials:
- Supabase API keys
- Stripe API keys
- Resend API key
- Twilio credentials

4. **Set up the database:**
```bash
npm run db:push
```

5. **Generate TypeScript types from Supabase schema:**
```bash
npm run db:types
```

6. **Run the development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Available Scripts

```bash
# Development
npm run dev              # Start dev server

# Building
npm run build            # Build for production
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint

# Database Management
npm run db:push          # Push migrations to Supabase
npm run db:pull          # Pull schema changes from Supabase
npm run db:diff          # See pending migrations
npm run db:new           # Create new migration
npm run db:reset         # Reset local database
npm run db:types         # Generate TS types from schema
npm run db:status        # Check migration status

# Demo Data
npm run seed:demo        # Seed database with demo data
```

## 🎯 Core Features by Module

### 📅 Dashboard
- Real-time stats: Today's bookings, weekly revenue, no-show rate, active clients
- Visual timeline of today's appointments
- Upcoming bookings for next 7 days
- 30-day revenue chart
- Quick action buttons

### 📆 Calendar Management
- Week/Day/Month view toggle
- Drag-and-drop appointment management
- Click to create or edit bookings
- Color-coded status badges
- View full booking details in side panel

### 💰 Booking & Payments
- Create manual or client-initiated bookings
- Stripe integration for deposit collection
- Payment status tracking
- Automatic invoice generation
- Refund management

### 👥 Client Management
- Client database with contact info
- Complete booking history per client
- Loyalty tracking (returning client badges)
- Client notes and preferences
- No-show count tracking

### 🛠️ Services Management
- Create and manage services
- Set pricing and duration
- Configure deposit amounts
- Service-specific settings per profession
- Availability limits per service

### ⏰ Availability & Scheduling
- Weekly availability grid (Mon-Sun)
- Time picker for business hours
- Break time configuration
- Date-specific overrides
- Advance booking window settings
- Automatic buffer time between appointments

### 📋 Intake Forms & Waivers
- Drag-and-drop form builder
- Field types: text, dropdown, date, file upload, checkbox
- Pre-built templates per profession
- Digital signature capture
- Conditional field logic

### 🔔 Notifications & Reminders
- Configurable reminder schedule (48h, 24h, 2h before)
- Multi-channel: Email + SMS
- Customizable message templates
- Auto no-show follow-up
- Notification delivery log

### 📊 Analytics
- 30-day revenue tracking
- Monthly revenue bar chart with MRR overlay
- Booking statistics and trends
- Top services by revenue
- Client metrics and lifetime value
- Busiest hours heatmap

### 🌐 Public Booking Page
- Client-facing booking portal (no login required)
- Service selection
- Calendar with available dates
- Time slot picker
- Intake form completion
- Deposit payment via Stripe
- Booking confirmation with calendar links

## 🎭 Vertical-Specific Features

### 🤖 Tattoo Artists
- Portfolio grid on public page
- Style tags (traditional, neo-trad, blackwork, etc.)
- Reference photo requirement
- Session length options (1h, 2h, 3h, half-day, full-day)
- Aftercare waiver with signature

### 🐕 Dog Groomers
- 200+ breed selector in intake
- Auto-duration by breed size
- Aggressive/anxious dog flag
- Vaccination confirmation
- Multiple pets per booking
- Pickup/dropoff scheduling

### 🎵 Music Teachers
- Recurring lesson auto-scheduling
- Instrument selector
- Student skill level tracking
- Package billing (e.g., 4 lessons at discount)
- Lesson notes per session

### 💇 Mobile Beauty (Hair/Makeup)
- Location-based scheduling
- Travel time calculator
- "Cluster nearby" smart grouping
- Event type tags (wedding, shoot, regular)
- Add-on services stacking

## 💳 Subscription Plans

| Feature | Starter | Pro | Studio |
|---------|---------|-----|--------|
| **Price** | $19/mo | $49/mo | $79/mo |
| Bookings | Up to 50 | Unlimited | Unlimited |
| Services | 1 | Up to 5 | Up to 5 |
| Reminders | Email only | Email + SMS | Email + SMS |
| Intake Forms | — | ✅ | ✅ |
| Analytics | — | ✅ | ✅ |
| Waivers | — | ✅ | ✅ |
| Team Members | — | — | Up to 5 |
| White Label | — | — | ✅ |

## 🎨 Design System

**Color Palette (Teal-First):**
- Navy: `#0D1B2A` (Primary dark)
- Teal: `#00C2A8` (Primary action)
- Teal Mid: `#019587` (Hover)
- Teal Light: `#E1F5EE` (Backgrounds)
- Off-White: `#F4F7F9` (Content bg)
- Gold: `#F5A623` (Secondary)
- Red: `#E8474B` (Errors)

**Key Design Rules:**
- Mobile-first (375px minimum)
- Light mode with navy sidebar
- Teal for interactive elements only
- Loading skeletons, not spinners
- Confirmation for destructive actions
- Zero dead ends in error states

## 📧 Email & SMS Templates

Pre-built, customizable templates for:
- ✉️ Booking confirmations
- ⏰ Appointment reminders
- 🔔 New booking alerts (pro)
- 😔 No-show follow-ups

## 🚀 Deployment

### Deploy to Vercel (Recommended)

```bash
vercel deploy
```

Or connect your GitHub repository to Vercel for automatic deployments.

### Environment Variables for Production
Make sure to set these in your Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `RESEND_API_KEY`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🔄 Database Migrations

To manage database schema changes:

```bash
# Create a new migration
npm run db:new migration_name

# View pending migrations
npm run db:status

# Push migrations to remote
npm run db:push

# Pull schema changes from Supabase
npm run db:pull
```

## 🌟 UX Principles

- ✅ Mobile-first design
- ✅ Optimistic UI updates
- ✅ Fewer clicks for common actions
- ✅ Meaningful empty states
- ✅ Clear error recovery paths
- ✅ Loading skeletons over spinners
- ✅ Confirmation before destructive actions

## ❌ What's NOT Included (v1)

- Native mobile app (PWA ready instead)
- Marketplace/discovery platform
- AI features or chatbots
- Video call integration
- Multi-language support
- Non-Stripe payment methods

## 📄 License

This project is open source. Check the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 💬 Support

For issues, feature requests, or questions, please open a GitHub issue.

---

**Built with ❤️ for service professionals who deserve better scheduling tools.**
