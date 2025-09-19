# DoneDep Integration Guide

## Domain Reseller & Stripe Connect Integration

This guide covers the complete integration of domain reselling capabilities and Stripe Connect payment processing into the DoneDep platform.

## 🚀 Quick Start

### 1. Environment Setup

Copy the environment template and configure your API keys:

```bash
cp backend/.env.example backend/.env
```

Configure the following required environment variables:

```env
# Domain Reseller (Namecheap)
NAMECHEAP_API_KEY="your-namecheap-api-key"
NAMECHEAP_API_USER="your-namecheap-username"
NAMECHEAP_CLIENT_IP="your-server-ip-address"
NAMECHEAP_SANDBOX="true"

# Stripe Connect
STRIPE_SECRET_KEY="sk_test_your-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret"
STRIPE_PLATFORM_FEE_PERCENT="2.9"

# Native Email Service
REDIS_URL="redis://localhost:6379"
EMAIL_TRACKING_DOMAIN="track.donedep.com"
```

### 2. Database Migration

Run the database migration to create payment and domain reseller tables:

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### 3. Install Dependencies

Install the required packages:

```bash
cd backend
npm install stripe xml2js express-rate-limit axios @types/xml2js
```

## 📋 API Endpoints

### Domain Reseller API (`/api/domain-reseller`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/search` | Search available domains |
| GET | `/pricing` | Get domain pricing |
| POST | `/register` | Register a domain |
| GET | `/user-domains` | Get user's domains |
| GET | `/:domain/info` | Get domain information |
| PUT | `/:domain/nameservers` | Update nameservers |
| GET | `/:domain/dns` | Get DNS records |
| PUT | `/:domain/dns` | Update DNS records |
| POST | `/:domain/renew` | Renew domain |
| PUT | `/:domain/whois-privacy` | Toggle WHOIS privacy |

### Stripe Connect API (`/api/stripe-connect`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/create-account` | Create Express account |
| GET | `/accounts` | Get user payment accounts |
| GET | `/account/:id/status` | Get account status |
| POST | `/account/:id/onboard` | Create onboarding link |
| GET | `/account/:id/dashboard` | Get dashboard link |
| POST | `/payment-intent` | Create payment intent |
| POST | `/checkout-session` | Create checkout session |
| GET | `/account/:id/analytics` | Get payment analytics |
| POST | `/webhook` | Handle Stripe webhooks |

### Native Email API (`/api/native-email`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/setup-domain` | Setup email domain |
| POST | `/send` | Send email |
| GET | `/templates` | Get email templates |
| POST | `/templates` | Create email template |
| GET | `/analytics` | Get email analytics |
| POST | `/campaigns` | Create email campaign |

## 🔧 Configuration

### Namecheap Reseller Setup

1. Sign up for Namecheap Reseller account
2. Get API credentials from your reseller dashboard
3. Whitelist your server IP address
4. Configure sandbox mode for testing

### Stripe Connect Setup

1. Create Stripe account and get API keys
2. Enable Connect in your Stripe dashboard
3. Configure webhook endpoints
4. Set up platform fee structure

### Native Email Service

1. Configure DNS records for your domain
2. Set up SPF, DKIM, and DMARC records
3. Configure Redis for queue management
4. Set up tracking domain

## 🏗️ Architecture

### Domain Reseller Service

- **DomainResellerService**: Core service for Namecheap API integration
- **DomainResellerController**: HTTP endpoints and validation
- **Routes**: Express routes with rate limiting and authentication

### Stripe Connect Service

- **StripeConnectService**: Stripe API integration and account management
- **StripeConnectController**: Payment processing endpoints
- **Webhook handling**: Secure webhook processing for payment events

### Native Email Service

- **NativeEmailService**: SMTP server and email processing
- **Email templates**: Dynamic template engine
- **Analytics**: Email tracking and reporting
- **Queue management**: Redis-based email queue

## 🔒 Security Features

- Rate limiting on all endpoints
- JWT authentication required
- Input validation and sanitization
- Secure webhook signature verification
- Environment-based configuration
- SQL injection prevention with Prisma

## 📊 Database Schema

### Payment Tables

```sql
-- Payment accounts for Stripe Connect
payment_accounts (
  id, userId, provider, stripeAccountId, 
  accountType, status, country, currency,
  businessType, chargesEnabled, payoutsEnabled
)

-- Payment transactions
payment_transactions (
  id, paymentAccountId, stripeAccountId,
  stripePaymentIntentId, amount, currency,
  applicationFee, status, description
)
```

### Email Service Tables

```sql
-- Email services and campaigns
email_services, email_campaigns, emails,
email_templates, email_analytics,
email_clicks, email_suppression_list
```

## 🚦 Rate Limiting

- Domain operations: 50 requests per 15 minutes
- Domain registrations: 10 per hour
- Payment operations: 100 requests per 15 minutes
- Account creation: 5 attempts per hour

## 🔍 Monitoring & Analytics

### Payment Analytics
- Transaction volumes and success rates
- Revenue tracking with platform fees
- Account onboarding metrics
- Payout schedules and amounts

### Domain Analytics
- Registration success rates
- Popular TLDs and pricing
- Renewal rates and revenue
- DNS management usage

### Email Analytics
- Delivery rates and bounce tracking
- Open and click-through rates
- Campaign performance metrics
- Suppression list management

## 🛠️ Development Workflow

1. **Feature Development**: Implement new features in isolated branches
2. **Testing**: Unit and integration tests for all endpoints
3. **Migration**: Database schema changes with proper migrations
4. **Documentation**: Update API documentation and guides
5. **Deployment**: Staged deployment with monitoring

## 📈 Business Model

### Revenue Streams

1. **Domain Reselling**: Markup on domain registrations and renewals
2. **Stripe Platform Fees**: 2.9% + $0.30 per transaction
3. **Email Service**: Tiered pricing based on volume
4. **Premium Features**: Advanced analytics and management tools

### Pricing Strategy

- **Domain markup**: 15-25% above wholesale prices
- **Payment processing**: Competitive rates with transparent fees
- **Email service**: Volume-based pricing tiers
- **Platform fees**: Percentage-based revenue sharing

## 🔄 Next Steps

1. **Frontend Integration**: Build React components for domain and payment management
2. **CLI Tools**: Windsurf CLI integration for automated setup
3. **Advanced Features**: Domain transfer, bulk operations, advanced analytics
4. **Scaling**: Load balancing, caching, and performance optimization
5. **Compliance**: GDPR, PCI DSS, and other regulatory requirements

## 📞 Support

For technical support and integration assistance:
- Documentation: `/docs`
- API Reference: `/api-docs`
- Support Email: support@donedep.com
- Developer Discord: [Link]

---

**DoneDep Platform** - Autonomous Deployment Made Simple
