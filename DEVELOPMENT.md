# DoneDep Development Guide

## Quick Start

### Prerequisites
- Node.js 18+ and npm 8+
- PostgreSQL 14+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/imranbaloch11/DoneDep.git
   cd DoneDep
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   
   # Frontend
   cp frontend/.env.example frontend/.env.local
   ```

4. **Configure database**
   ```bash
   # Create PostgreSQL database
   createdb donedep_dev
   
   # Update DATABASE_URL in backend/.env
   DATABASE_URL="postgresql://username:password@localhost:5432/donedep_dev"
   ```

5. **Run database migrations**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma generate
   ```

6. **Start development servers**
   ```bash
   # From project root - starts both frontend and backend
   npm run dev
   
   # Or individually:
   npm run dev:frontend  # Frontend on http://localhost:3000
   npm run dev:backend   # Backend on http://localhost:5000
   ```

## Project Structure

```
DoneDep/
├── frontend/           # Next.js React frontend
│   ├── src/
│   │   ├── app/       # Next.js app router pages
│   │   ├── components/ # Reusable components
│   │   ├── contexts/  # React contexts
│   │   ├── services/  # API services
│   │   └── utils/     # Utility functions
│   └── package.json
├── backend/            # Express.js API server
│   ├── src/
│   │   ├── controllers/ # Route controllers
│   │   ├── middleware/  # Express middleware
│   │   ├── routes/     # API routes
│   │   ├── services/   # Business logic
│   │   └── utils/      # Utility functions
│   ├── prisma/         # Database schema & migrations
│   └── package.json
├── shared/             # Shared TypeScript types
│   ├── src/
│   │   ├── types/     # Type definitions
│   │   └── utils/     # Shared utilities
│   └── package.json
└── package.json        # Root workspace config
```

## Development Workflow

### 1. Feature Development
- Create feature branch: `git checkout -b feature/your-feature-name`
- Develop frontend and backend components together
- Test integration between components
- Create pull request when complete

### 2. Database Changes
```bash
# Create new migration
cd backend
npx prisma migrate dev --name your_migration_name

# Reset database (development only)
npx prisma migrate reset
```

### 3. Adding New API Endpoints
1. Define types in `shared/src/types/`
2. Create controller in `backend/src/controllers/`
3. Add routes in `backend/src/routes/`
4. Create frontend service in `frontend/src/services/api/`
5. Implement UI components

### 4. Testing
```bash
# Run all tests
npm test

# Run specific workspace tests
npm run test:frontend
npm run test:backend
npm run test:shared

# Run with coverage
npm run test:coverage
```

## Environment Configuration

### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/donedep_dev"

# JWT Secrets
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@donedep.com"

# Frontend URL
FRONTEND_URL="http://localhost:3000"

# Server Configuration
PORT="5000"
NODE_ENV="development"
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## Available Scripts

### Root Level
- `npm run dev` - Start both frontend and backend
- `npm run build` - Build all packages
- `npm run lint` - Lint all packages
- `npm run type-check` - Type check all packages
- `npm test` - Run all tests

### Frontend
- `npm run dev:frontend` - Start Next.js dev server
- `npm run build:frontend` - Build for production
- `npm run lint:frontend` - Lint frontend code

### Backend
- `npm run dev:backend` - Start Express dev server
- `npm run build:backend` - Build backend
- `npm run lint:backend` - Lint backend code

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset
- `GET /api/auth/me` - Get current user

### Deployment Endpoints
- `GET /api/deployments` - List user deployments
- `POST /api/deployments` - Create new deployment
- `GET /api/deployments/:id` - Get deployment details
- `DELETE /api/deployments/:id` - Delete deployment
- `POST /api/deployments/:id/redeploy` - Redeploy project

### Domain Endpoints
- `GET /api/domains` - List user domains
- `POST /api/domains/register` - Register new domain
- `GET /api/domains/:id` - Get domain details
- `DELETE /api/domains/:id` - Delete domain

### Database Endpoints
- `GET /api/databases` - List user databases
- `POST /api/databases` - Create new database
- `GET /api/databases/:id` - Get database details
- `DELETE /api/databases/:id` - Delete database

### Email Service Endpoints
- `GET /api/email-services` - List user email services
- `POST /api/email-services` - Create email service
- `GET /api/email-services/:id` - Get email service details
- `DELETE /api/email-services/:id` - Delete email service

## Troubleshooting

### Common Issues

1. **Database connection errors**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL in backend/.env
   - Run `npx prisma migrate dev` to apply migrations

2. **Frontend build errors**
   - Clear Next.js cache: `rm -rf frontend/.next`
   - Reinstall dependencies: `npm install`

3. **TypeScript errors**
   - Run type check: `npm run type-check`
   - Regenerate Prisma client: `cd backend && npx prisma generate`

4. **CORS errors**
   - Check CORS_ORIGIN in backend/.env
   - Ensure frontend URL matches CORS configuration

### Debug Mode
```bash
# Enable debug logging
DEBUG=donedep:* npm run dev:backend

# Frontend debug mode
NODE_ENV=development npm run dev:frontend
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes following the coding standards
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit pull request

### Coding Standards
- Use TypeScript for all new code
- Follow ESLint configuration
- Write tests for new features
- Use conventional commit messages
- Keep functions small and focused
- Document complex logic

## Deployment

### Development
- Frontend: Vercel (automatic from main branch)
- Backend: Railway (automatic from main branch)
- Database: Railway PostgreSQL

### Production
- Frontend: Vercel Pro
- Backend: Railway Pro
- Database: Railway PostgreSQL with backups
- Monitoring: Railway metrics + custom dashboards

## Support

- Documentation: `/docs` (when available)
- Issues: GitHub Issues
- Discussions: GitHub Discussions
- Email: support@donedep.com
