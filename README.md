# Chingu - AI-Powered Finance Tracker

Meet Chingu, your friendly AI finance buddy that makes expense tracking effortless and fun. Track expenses, scan receipts, get smart insights, and manage your finances with the help of an intelligent assistant.

## ✨ Features

- **Smart Receipt Scanner**: Snap photos of receipts and let AI automatically extract and categorize expenses
- **Email Bill Detection**: Chingu monitors your inbox for bills and automatically updates your expenses
- **Financial Dashboard**: Complete overview of your accounts, expenses, income, and savings
- **AI-Powered Insights**: Get personalized suggestions and financial advice
- **Budget Tracking**: Set and monitor budgets with visual progress indicators
- **Transaction Management**: Easy expense and income tracking with categories
- **Monthly Reports**: Clean, shareable visualizations of your spending habits
- **Smart Reminders**: Never miss a bill with gentle notifications
- **Multi-Currency Support**: Track finances in your preferred currency

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- A database (PostgreSQL recommended)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd chingu-finance-tracker
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Configure the following environment variables:
- `DATABASE_URL`: Your PostgreSQL connection string
- `CLERK_SECRET_KEY`: Clerk authentication secret
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk publishable key
- `RESEND_API_KEY`: For email notifications
- `GOOGLE_GENERATIVE_AI_API_KEY`: For AI features

4. Set up the database:
```bash
npm run db:push
# or
npx prisma db push
```

5. Seed the database (optional):
```bash
npm run seed
```

6. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see Chingu in action!

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Authentication**: Clerk
- **Database**: PostgreSQL with Prisma ORM
- **AI/ML**: Google Generative AI
- **Email**: Resend with React Email
- **Charts**: Recharts
- **Forms**: React Hook Form with Zod validation
- **Notifications**: Sonner

## 📱 Usage

### Getting Started
1. Sign up or sign in using Clerk authentication
2. Complete the onboarding to set your preferred currency
3. Start adding accounts and tracking transactions

### Adding Transactions
- **Manual Entry**: Use the "Add Transaction" form
- **Receipt Scanning**: Take a photo of receipts for automatic data extraction
- **Email Integration**: Let Chingu scan your emails for bills

### Dashboard Features
- View account balances and transaction history
- Monitor budget progress with visual indicators
- Get AI-powered financial insights and recommendations
- Generate monthly spending reports

## 🔧 Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run email` - Start email development server
- `npm run check-all` - Run linting and type checking

## 📁 Project Structure

```
├── app/                 # Next.js app router
│   ├── (auth)/         # Authentication pages
│   ├── (main)/         # Main application pages
│   └── api/            # API routes
├── components/         # Reusable UI components
│   ├── ui/            # Base UI components
│   └── providers/     # Context providers
├── actions/           # Server actions
├── lib/              # Utilities and configurations
├── hooks/            # Custom React hooks
├── prisma/           # Database schema and migrations
└── emails/           # Email templates
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Authentication by [Clerk](https://clerk.com/)

---

Made with ❤️ by  @manovHacksaw. Start your financial journey today!
