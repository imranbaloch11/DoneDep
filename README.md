# DoneDep Frontend

## 🚀 Autonomous Deployment Platform - Frontend Application

This is the frontend application for DoneDep, providing a beautiful and intuitive interface for managing deployments, domains, payments, and email services.

## ✨ Features

### Core Interface
- **Dashboard**: Comprehensive deployment management
- **Domain Management**: Search, register, and configure domains
- **Payment Processing**: Stripe Connect integration for user payments
- **Email Services**: Native email service management
- **User Authentication**: Secure login with email verification

### Advanced Features
- **Real-time Updates**: Live deployment status and analytics
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Type Safety**: Full TypeScript integration with shared types
- **Modern UI**: Beautiful components with Framer Motion animations
- **Form Management**: React Hook Form for performant forms

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS with custom components
- **State Management**: React Context API and hooks
- **Forms**: React Hook Form with validation
- **HTTP Client**: Axios with interceptors
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Project Structure
```
src/
├── components/        # Reusable UI components
├── features/          # Feature-specific components
│   ├── dealdeck-pro/  # Pro dashboard features
│   └── dealdeck-user/ # User dashboard features
├── pages/             # Next.js pages
├── services/          # API service layers
│   └── api/           # API client and endpoints
├── hooks/             # Custom React hooks
├── utils/             # Utility functions
└── styles/            # Global styles
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 8+

### Installation
```bash
npm install
```

### Environment Setup
```bash
cp .env.example .env.local
```

Configure your environment variables:
```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

## 🔌 API Integration

### Backend Connection
- **API Base URL**: Configurable via environment variables
- **Authentication**: JWT tokens with automatic refresh
- **Error Handling**: Comprehensive error management with toast notifications
- **Type Safety**: Shared TypeScript types with backend

### Service Layers
- `auth.ts` - Authentication and user management
- `domainReseller.ts` - Domain search, registration, DNS management
- `stripeConnect.ts` - Payment processing and account management
- `nativeEmail.ts` - Email service, templates, and campaigns

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy to Vercel
```

### Docker
```bash
docker build -t donedep-frontend .
docker run -p 3000:3000 donedep-frontend
```

## 🔧 Configuration

### Environment Variables
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_APP_URL`: Frontend application URL
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key

### Build Configuration
- **TypeScript**: Strict mode enabled
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting
- **Tailwind**: Utility-first CSS framework

## 🤝 Related Repositories

- **Backend**: [DonedepBackend](https://github.com/imranbaloch11/DonedepBackend)
- **Shared Types**: Included in backend repository

---

**Part of the DoneDep Platform** - Autonomous deployment made simple.
