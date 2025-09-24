import express from 'express';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { ChatSession } from '../models/ChatSession';
import { DeploymentContext } from '../models/DeploymentContext';
import { createError } from '../middleware/errorHandler';

const router = express.Router();

// Initialize OpenAI
let openai: OpenAI | null = null;
console.log('🔑 OpenAI API Key check:', process.env.OPENAI_API_KEY ? 'Key found' : 'No key found');
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  console.log('✅ OpenAI initialized successfully');
} else {
  console.log('❌ OpenAI not initialized - missing or placeholder API key');
}

// System prompt for DeployAgent
const SYSTEM_PROMPT = `You are DeployAgent, an intelligent deployment orchestrator and DevOps expert. You help users deploy applications, set up infrastructure, configure CI/CD pipelines, and manage cloud resources.

Your capabilities include:
- Analyzing project structure and recommending deployment strategies
- Setting up CI/CD pipelines (GitHub Actions, GitLab CI, etc.)
- Configuring cloud infrastructure (AWS, GCP, Azure, DigitalOcean)
- Container orchestration (Docker, Kubernetes)
- Database setup and management
- Domain configuration and SSL certificates
- Monitoring and logging setup
- Security best practices
- Cost optimization recommendations

You can also help with:
- GitHub repository analysis and integration
- Automated testing setup
- Performance optimization
- Scaling strategies
- Disaster recovery planning

Always provide practical, actionable advice with specific commands, configurations, and step-by-step instructions. When suggesting deployments, consider cost, scalability, and maintenance requirements.

If a user wants to connect their GitHub account or deploy a specific repository, guide them through the process and offer to analyze their project structure.`;

// Initialize chat session
router.post('/chat/init', async (req, res, next) => {
  try {
    const sessionId = uuidv4();
    
    // Create new chat session
    const chatSession = new ChatSession({
      sessionId,
      messages: [],
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await chatSession.save();

    const welcomeMessage = `Hello! I'm DeployAgent, your intelligent deployment orchestrator. I can help you with:

🚀 **Deployment & Infrastructure**
- Analyze your projects and recommend deployment strategies
- Set up CI/CD pipelines and automated deployments
- Configure cloud infrastructure and scaling

🔗 **GitHub Integration**
- Connect your GitHub account to analyze repositories
- Set up automated deployments from your repos
- Configure GitHub Actions workflows

🌐 **Domain & SSL**
- Help you register and configure domains
- Set up SSL certificates and security

📊 **Monitoring & Optimization**
- Set up monitoring and logging
- Optimize performance and costs
- Implement best practices

What would you like to deploy today? You can start by connecting your GitHub account or telling me about your project!`;

    res.json({
      success: true,
      data: {
        sessionId,
        message: welcomeMessage
      }
    });

  } catch (error) {
    next(error);
  }
});

// Send message to DeployAgent
router.post('/chat/message', async (req, res, next) => {
  try {
    const { message, sessionId, contextId } = req.body;

    if (!message || !sessionId) {
      throw createError('Message and sessionId are required', 400);
    }

    // Find chat session
    const chatSession = await ChatSession.findOne({ sessionId });
    if (!chatSession) {
      throw createError('Chat session not found', 404);
    }

    // Add user message to session
    const userMessage = {
      role: 'user' as const,
      content: message,
      timestamp: new Date()
    };

    chatSession.messages.push(userMessage);

    // Prepare messages for OpenAI
    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...chatSession.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    let assistantResponse: string;

    if (openai) {
      // Get response from OpenAI
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      });

      assistantResponse = completion.choices[0]?.message?.content || 'I apologize, but I encountered an issue processing your request. Please try again.';
    } else {
      // Fallback response when OpenAI is not configured
      assistantResponse = `I understand you want to discuss: "${message}". 

However, I need an OpenAI API key to provide intelligent responses. Please:

1. Get an OpenAI API key from https://platform.openai.com/api-keys
2. Add it to your server/.env file as OPENAI_API_KEY=your_key_here
3. Restart the backend server

In the meantime, I can help you with:
🔗 **GitHub Integration** - Connect your repositories
🚀 **Project Analysis** - Analyze your codebase structure  
🌐 **Deployment Guidance** - Get deployment recommendations
📊 **Infrastructure Planning** - Plan your deployment strategy

Would you like to connect your GitHub account to get started?`;
    }

    // Add assistant response to session
    const assistantMessage = {
      role: 'assistant' as const,
      content: assistantResponse,
      timestamp: new Date()
    };

    chatSession.messages.push(assistantMessage);
    chatSession.updatedAt = new Date();
    await chatSession.save();

    // Analyze response for actions
    const actions = analyzeResponseForActions(assistantResponse);

    res.json({
      success: true,
      data: {
        message: assistantResponse,
        actions,
        sessionId,
        contextId
      }
    });

  } catch (error) {
    console.error('DeployAgent chat error:', error);
    next(error);
  }
});

// Get chat history
router.get('/chat/:sessionId/history', async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const chatSession = await ChatSession.findOne({ sessionId });
    if (!chatSession) {
      throw createError('Chat session not found', 404);
    }

    res.json({
      success: true,
      data: {
        messages: chatSession.messages,
        contextId: chatSession.contextId,
        status: chatSession.status
      }
    });

  } catch (error) {
    next(error);
  }
});

// Analyze project for deployment
router.post('/analyze', async (req, res, next) => {
  try {
    const { repository, requirements } = req.body;

    if (!repository || !repository.url) {
      throw createError('Repository information is required', 400);
    }

    // Create analysis context
    const contextId = uuidv4();
    const analysisPrompt = `Analyze this repository for deployment:

Repository: ${repository.url}
Branch: ${repository.branch || 'main'}
Framework: ${repository.framework || 'Unknown'}
Language: ${repository.language || 'Unknown'}

Requirements:
${JSON.stringify(requirements, null, 2)}

Please provide:
1. Deployment strategy recommendations
2. Infrastructure requirements
3. Estimated costs
4. Security considerations
5. Scaling recommendations
6. Step-by-step deployment guide`;

    let analysis: string;

    if (openai) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: analysisPrompt }
        ],
        max_tokens: 1500,
        temperature: 0.3,
      });

      analysis = completion.choices[0]?.message?.content || 'Analysis could not be completed.';
    } else {
      // Fallback analysis when OpenAI is not configured
      analysis = `## Project Analysis for ${repository.url}

**Framework:** ${repository.framework || 'Unknown'}
**Language:** ${repository.language || 'Unknown'}
**Branch:** ${repository.branch || 'main'}

### Deployment Recommendations:

1. **Vercel** - Great for Next.js and React applications
   - Cost: Free tier available, $20/month for pro
   - Best for: Frontend applications with serverless functions

2. **Railway** - Simple deployment with database support
   - Cost: $5/month per service
   - Best for: Full-stack applications

3. **DigitalOcean App Platform** - Managed platform
   - Cost: $5-12/month depending on resources
   - Best for: Scalable applications

### Next Steps:
1. Connect your GitHub repository for detailed analysis
2. Configure environment variables
3. Set up CI/CD pipeline
4. Choose deployment platform

*Note: For detailed AI-powered analysis, please configure your OpenAI API key.*`;
    }

    // Save deployment context
    const deploymentContext = new DeploymentContext({
      contextId,
      projectId: repository.url.split('/').pop() || 'unknown',
      repository,
      requirements,
      status: 'planning',
      steps: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await deploymentContext.save();

    res.json({
      success: true,
      data: {
        contextId,
        analysis,
        recommendations: {
          summary: 'Analysis completed successfully',
          complexity: Math.floor(Math.random() * 5) + 1,
          estimatedCost: '$10-50/month'
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// Get deployments
router.get('/deployments', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const deployments = await DeploymentContext.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await DeploymentContext.countDocuments();

    res.json({
      success: true,
      data: {
        deployments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// Get deployment status
router.get('/deployments/:contextId/status', async (req, res, next) => {
  try {
    const { contextId } = req.params;

    const context = await DeploymentContext.findOne({ contextId });
    if (!context) {
      throw createError('Deployment context not found', 404);
    }

    res.json({
      success: true,
      data: {
        context,
        recentActions: [],
        status: context.status
      }
    });

  } catch (error) {
    next(error);
  }
});

// Submit feedback
router.post('/deployments/:contextId/feedback', async (req, res, next) => {
  try {
    const { contextId } = req.params;
    const { rating, comment } = req.body;

    const context = await DeploymentContext.findOne({ contextId });
    if (!context) {
      throw createError('Deployment context not found', 404);
    }

    // Here you would save feedback to database
    console.log(`Feedback for ${contextId}: Rating ${rating}, Comment: ${comment}`);

    res.json({
      success: true,
      message: 'Feedback submitted successfully'
    });

  } catch (error) {
    next(error);
  }
});

// Get knowledge stats
router.get('/knowledge/stats', async (req, res, next) => {
  try {
    // Mock knowledge stats for now
    const stats = {
      totalPatterns: 150,
      totalExecutions: 1250,
      topPatterns: [
        {
          pattern: 'Next.js Deployment',
          description: 'Deploy Next.js applications to Vercel',
          usageCount: 45,
          successRate: 0.95
        },
        {
          pattern: 'Docker Containerization',
          description: 'Containerize applications with Docker',
          usageCount: 38,
          successRate: 0.92
        },
        {
          pattern: 'CI/CD Pipeline Setup',
          description: 'Set up GitHub Actions workflows',
          usageCount: 32,
          successRate: 0.88
        }
      ],
      categoryStats: [
        { _id: 'frontend', count: 85, avgSuccessRate: 0.93 },
        { _id: 'backend', count: 65, avgSuccessRate: 0.89 },
        { _id: 'database', count: 45, avgSuccessRate: 0.91 }
      ]
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    next(error);
  }
});

// Helper function to analyze response for actions
function analyzeResponseForActions(response: string) {
  const actions = [];

  // Check for GitHub-related actions
  if (response.toLowerCase().includes('github') || response.toLowerCase().includes('repository')) {
    actions.push({
      type: 'github_connect',
      content: 'Connect GitHub Account',
      description: 'Connect your GitHub account to analyze repositories'
    });
  }

  // Check for deployment actions
  if (response.toLowerCase().includes('deploy') || response.toLowerCase().includes('deployment')) {
    actions.push({
      type: 'start_deployment',
      content: 'Start Deployment',
      description: 'Begin the deployment process'
    });
  }

  // Check for domain actions
  if (response.toLowerCase().includes('domain') || response.toLowerCase().includes('dns')) {
    actions.push({
      type: 'domain_setup',
      content: 'Setup Domain',
      description: 'Configure domain and DNS settings'
    });
  }

  return actions;
}

export default router;
