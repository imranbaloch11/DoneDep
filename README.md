# DoneDep - Agentic Deployment Platform

DoneDep is an AI-powered deployment platform that provides intelligent deployment assistance through an advanced chat interface. It integrates with GitHub, analyzes your projects, and provides step-by-step deployment guidance using OpenAI's GPT-4.

## 🚀 Features

- **AI-Powered Chat Interface**: Intelligent deployment assistant powered by OpenAI GPT-4
- **GitHub Integration**: Connect repositories, analyze project structure, and get deployment recommendations
- **Project Analysis**: Automatic framework detection and deployment strategy recommendations
- **Real-time Deployment Guidance**: Step-by-step instructions for various deployment platforms
- **Cost Estimation**: Get cost estimates for different deployment options
- **Multi-Platform Support**: Support for Vercel, Netlify, Railway, DigitalOcean, and more

## 🏗️ Architecture

- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS, and Framer Motion
- **Backend**: Express.js with TypeScript, MongoDB, and OpenAI integration
- **Database**: MongoDB for chat sessions and deployment contexts
- **AI**: OpenAI GPT-4 for intelligent deployment assistance
- **GitHub API**: Repository analysis and project structure detection

## 📋 Prerequisites

Before running DoneDep, make sure you have:

- Node.js 18+ installed
- MongoDB running locally or a MongoDB connection string
- OpenAI API key
- GitHub Personal Access Token (for repository integration)

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/imranbaloch11/DoneDep.git
cd DoneDep
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd server
npm install
cd ..
```

### 4. Configure Environment Variables

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

#### Backend (server/.env)
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/donedep

# OpenAI Configuration - REQUIRED
OPENAI_API_KEY=your_openai_api_key_here

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# JWT Configuration
JWT_SECRET=your_jwt_secret_here_make_it_long_and_secure
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here_also_long_and_secure

# WebSocket Server
WEBSOCKET_PORT=8080

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 5. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# macOS with Homebrew
brew services start mongodb-community

# Or run directly
mongod
```

### 6. Start the Application

#### Option 1: Run Both Services Separately

Terminal 1 (Backend):
```bash
cd server
npm run dev
```

Terminal 2 (Frontend):
```bash
npm run dev
```

#### Option 2: Use the Start Script (Coming Soon)
```bash
npm run start:all
```

### 7. Access the Application

Open [http://localhost:3000](http://localhost:3000) in your browser. You'll be redirected directly to the Agentic Deploy interface.

## 🔑 Getting API Keys

### OpenAI API Key
1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add it to your `server/.env` file as `OPENAI_API_KEY`

### GitHub Personal Access Token
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate a new token with these permissions:
   - `repo` (Full control of private repositories)
   - `read:user` (Read user profile data)
   - `workflow` (Update GitHub Action workflows)
3. Use this token in the GitHub Connect modal in the app

## 🎯 Usage

1. **Start a Chat**: The AI assistant will greet you and explain its capabilities
2. **Connect GitHub**: Click the "Connect GitHub Account" action button or ask the AI to help you connect
3. **Analyze Projects**: Select a repository to analyze its structure and get deployment recommendations
4. **Get Deployment Guidance**: Ask specific questions about deployment strategies, costs, or technical requirements
5. **Follow Instructions**: The AI will provide step-by-step deployment instructions

## 🤖 AI Capabilities

The DeployAgent can help with:

- **Project Analysis**: Detect frameworks, languages, and project structure
- **Deployment Strategies**: Recommend optimal deployment platforms
- **Cost Estimation**: Provide cost estimates for different options
- **CI/CD Setup**: Guide you through setting up automated deployments
- **Infrastructure Configuration**: Help configure databases, domains, SSL certificates
- **Troubleshooting**: Debug deployment issues and provide solutions
- **Best Practices**: Share security and performance optimization tips

## 🔧 Development

### Project Structure

```
DoneDep/
├── src/                          # Frontend source code
│   ├── app/                      # Next.js App Router pages
│   ├── components/               # React components
│   │   └── deployagent/          # AI chat interface components
│   ├── services/api/             # API service layer
│   └── utils/                    # Utility functions
├── server/                       # Backend source code
│   ├── src/
│   │   ├── routes/               # API routes
│   │   ├── models/               # Database models
│   │   ├── middleware/           # Express middleware
│   │   └── config/               # Configuration files
│   └── package.json
└── package.json                  # Frontend dependencies
```

### API Endpoints

- `POST /deployagent/chat/init` - Initialize chat session
- `POST /deployagent/chat/message` - Send message to AI
- `GET /deployagent/chat/:sessionId/history` - Get chat history
- `POST /deployagent/analyze` - Analyze project for deployment
- `POST /github/connect` - Connect GitHub account
- `POST /github/analyze` - Analyze repository
- `GET /health` - Health check endpoint

## 🚀 Deployment

The application can be deployed to various platforms:

- **Frontend**: Vercel, Netlify, or any static hosting service
- **Backend**: Railway, DigitalOcean App Platform, or any Node.js hosting service
- **Database**: MongoDB Atlas or any managed MongoDB service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check that all environment variables are set correctly
2. Ensure MongoDB is running
3. Verify your OpenAI API key has sufficient credits
4. Check the console for error messages

For additional support, please open an issue on GitHub.

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
