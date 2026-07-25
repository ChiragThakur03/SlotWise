# 🎯 SlotWise

A vertical-specific booking & scheduling SaaS for service professionals (tattoo artists, dog groomers, music teachers, mobile beauty professionals). Built with Next.js, Supabase, and Stripe.

## ✨ Key Features

- **Smart Booking & Scheduling** - Week/day/month calendar views with drag-and-drop management
- **Stripe Payments** - Deposit collection and payment processing
- **Client CRM** - Booking history, loyalty tracking, and intake forms
- **Multi-Channel Reminders** - Automated email & SMS notifications
- **Analytics Dashboard** - Revenue tracking and booking insights
- **Public Booking Page** - Clients can book without creating an account
- **Team Management** - Assign services to staff (Studio plan)
- **No-Show Protection** - Automatic flagging and follow-up system
- **Mobile-First Design** - Fully responsive and optimized for mobile

## 🏗️ Tech Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript
- **Database:** Supabase + PostgreSQL
- **Payments:** Stripe (subscriptions & deposits)
- **Notifications:** Resend (Email) + Twilio (SMS)
- **UI:** Tailwind CSS + Radix UI
- **Hosting:** Vercel

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase, Stripe, Resend, and Twilio accounts

### Installation

```bash
git clone https://github.com/ChiragThakur03/SlotWise.git
cd SlotWise
npm install
cp .env.local.example .env.local
```

Fill in your API keys in `.env.local`, then:

```bash
npm run db:push          # Push database migrations
npm run db:types         # Generate TypeScript types
npm run dev              # Start development server
```

## 📝 Available Scripts

```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint
npm run db:push          # Push migrations to Supabase
npm run db:pull          # Pull schema changes
npm run seed:demo        # Seed with demo data
```

## 💳 Subscription Plans

| Feature | Starter | Pro | Studio |
|---------|---------|-----|--------|
| Price | $19/mo | $49/mo | $79/mo |
| Bookings | Up to 50 | Unlimited | Unlimited |
| Services | 1 | Up to 5 | Up to 5 |
| Reminders | Email | Email + SMS | Email + SMS |
| Intake Forms | — | ✅ | ✅ |
| Analytics | — | ✅ | ✅ |
| Team Members | — | — | Up to 5 |
| White Label | — | — | ✅ |

## 🎭 Vertical-Specific Features

- **Tattoo Artists:** Portfolio display, style tags, reference photos, session lengths
- **Dog Groomers:** Breed selector, vaccination tracking, multi-pet bookings
- **Music Teachers:** Recurring lessons, instrument tracking, lesson packages
- **Mobile Beauty:** Location-based scheduling, travel time calculator, smart grouping

## 📦 Deployment

Connect your GitHub repo to Vercel for automatic deployments, or run:

```bash
vercel deploy
```

Set these environment variables in your Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `STRIPE_SECRET_KEY` & `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `RESEND_API_KEY`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)

## 🤝 Contributing

Contributions are welcome! Please submit a Pull Request or open an issue for feature requests and bug reports.

## 📄 License

Open source. Check the LICENSE file for details.

---

**Built with ❤️ for service professionals who deserve better scheduling tools.**
