import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { DeploymentArchitecture, IDeploymentComponent } from '../models/DeploymentArchitecture';
import { createError } from '../middleware/errorHandler';
import axios from 'axios';

const router = express.Router();

// Create deployment architecture from GitHub repository
router.post('/create', async (req, res, next) => {
  try {
    const { 
      repositoryUrl, 
      repositoryBranch = 'main', 
      userId = 'default-user',
      testEmail 
    } = req.body;

    if (!repositoryUrl) {
      throw createError('Repository URL is required', 400);
    }

    // Extract project info from repository URL
    const projectName = repositoryUrl.split('/').pop()?.replace('.git', '') || 'unknown-project';
    const projectId = uuidv4();

    // Analyze repository to determine framework and language
    const repoAnalysis = await analyzeRepository(repositoryUrl, repositoryBranch);

    // Create initial deployment components based on analysis
    const components = createInitialComponents(repoAnalysis);

    const deploymentArchitecture = new DeploymentArchitecture({
      userId,
      projectId,
      repositoryUrl,
      repositoryBranch,
      projectName,
      framework: repoAnalysis.framework,
      language: repoAnalysis.language,
      components,
      testEmail,
      overallStatus: 'configuring'
    });

    await deploymentArchitecture.save();

    // Start deployment process asynchronously
    startDeploymentProcess(projectId);

    res.json({
      success: true,
      projectId,
      deploymentArchitecture: {
        projectId,
        projectName,
        framework: repoAnalysis.framework,
        language: repoAnalysis.language,
        components: components.map(c => ({
          name: c.name,
          type: c.type,
          status: c.status,
          technology: c.technology
        })),
        overallStatus: 'configuring'
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get deployment architecture status
router.get('/:projectId', async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const deployment = await DeploymentArchitecture.findOne({ projectId });
    if (!deployment) {
      throw createError('Deployment not found', 404);
    }

    // Update component health checks
    await updateHealthChecks(deployment);

    res.json({
      success: true,
      deployment: {
        projectId: deployment.projectId,
        projectName: deployment.projectName,
        framework: deployment.framework,
        language: deployment.language,
        repositoryUrl: deployment.repositoryUrl,
        overallStatus: deployment.overallStatus,
        deploymentUrl: deployment.deploymentUrl,
        localTestUrl: deployment.localTestUrl,
        testEmail: deployment.testEmail,
        components: deployment.components.map(c => ({
          name: c.name,
          type: c.type,
          status: c.status,
          technology: c.technology,
          url: c.url,
          port: c.port,
          healthCheck: c.healthCheck,
          deployment: c.deployment,
          metrics: c.metrics,
          logs: c.logs.slice(-5) // Last 5 logs
        })),
        updatedAt: deployment.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update component status
router.patch('/:projectId/component/:componentType', async (req, res, next) => {
  try {
    const { projectId, componentType } = req.params;
    const { status, config, url, port, deployment } = req.body;

    const deploymentArch = await DeploymentArchitecture.findOne({ projectId });
    if (!deploymentArch) {
      throw createError('Deployment not found', 404);
    }

    const component = deploymentArch.components.find(c => c.type === componentType);
    if (!component) {
      throw createError('Component not found', 404);
    }

    // Update component
    if (status) component.status = status;
    if (config) component.config = { ...component.config, ...config };
    if (url) component.url = url;
    if (port) component.port = port;
    if (deployment) component.deployment = { ...component.deployment, ...deployment };

    // Add log entry
    component.logs.push({
      timestamp: new Date(),
      level: 'info',
      message: `Component ${componentType} updated`,
      details: { status, config, url, port, deployment }
    });

    await deploymentArch.save();

    res.json({
      success: true,
      component: {
        name: component.name,
        type: component.type,
        status: component.status,
        technology: component.technology,
        url: component.url,
        port: component.port
      }
    });
  } catch (error) {
    next(error);
  }
});

// Deploy component
router.post('/:projectId/component/:componentType/deploy', async (req, res, next) => {
  try {
    const { projectId, componentType } = req.params;
    const { provider = 'digitalocean', region = 'nyc1' } = req.body;

    const deploymentArch = await DeploymentArchitecture.findOne({ projectId });
    if (!deploymentArch) {
      throw createError('Deployment not found', 404);
    }

    const component = deploymentArch.components.find(c => c.type === componentType);
    if (!component) {
      throw createError('Component not found', 404);
    }

    // Start deployment process
    component.status = 'deploying';
    component.logs.push({
      timestamp: new Date(),
      level: 'info',
      message: `Starting deployment of ${componentType} to ${provider}`,
      details: { provider, region }
    });

    await deploymentArch.save();

    // Simulate deployment process (replace with real deployment logic)
    deployComponent(projectId, componentType, provider, region);

    res.json({
      success: true,
      message: `Deployment of ${componentType} started`,
      component: {
        name: component.name,
        type: component.type,
        status: component.status,
        technology: component.technology
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get component logs
router.get('/:projectId/component/:componentType/logs', async (req, res, next) => {
  try {
    const { projectId, componentType } = req.params;
    const { limit = 50 } = req.query;

    const deployment = await DeploymentArchitecture.findOne({ projectId });
    if (!deployment) {
      throw createError('Deployment not found', 404);
    }

    const component = deployment.components.find(c => c.type === componentType);
    if (!component) {
      throw createError('Component not found', 404);
    }

    const logs = component.logs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, Number(limit));

    res.json({
      success: true,
      logs
    });
  } catch (error) {
    next(error);
  }
});

// Set test email
router.post('/:projectId/test-email', async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      throw createError('Valid email address is required', 400);
    }

    const deployment = await DeploymentArchitecture.findOne({ projectId });
    if (!deployment) {
      throw createError('Deployment not found', 404);
    }

    deployment.testEmail = email;
    await deployment.save();

    // Configure SMTP for this email
    await configureTestEmail(projectId, email);

    res.json({
      success: true,
      message: 'Test email configured successfully',
      testEmail: email
    });
  } catch (error) {
    next(error);
  }
});

// Helper Functions

async function analyzeRepository(repositoryUrl: string, branch: string) {
  // Simulate repository analysis (replace with real GitHub API calls)
  try {
    // Extract owner and repo from URL
    const urlParts = repositoryUrl.replace('https://github.com/', '').replace('.git', '').split('/');
    const owner = urlParts[0];
    const repo = urlParts[1];

    // In a real implementation, you would:
    // 1. Use GitHub API to fetch repository contents
    // 2. Analyze package.json, requirements.txt, etc.
    // 3. Detect framework and language

    return {
      framework: 'Next.js', // Detected from package.json
      language: 'TypeScript', // Detected from file extensions
      hasBackend: true, // Detected from server folder or API routes
      hasFrontend: true, // Detected from React/Next.js
      hasDatabase: false, // Detected from database configs
      packageManager: 'npm' // Detected from lock files
    };
  } catch (error) {
    return {
      framework: 'Unknown',
      language: 'JavaScript',
      hasBackend: false,
      hasFrontend: true,
      hasDatabase: false,
      packageManager: 'npm'
    };
  }
}

function createInitialComponents(analysis: any): IDeploymentComponent[] {
  const components: IDeploymentComponent[] = [];

  // Frontend component
  if (analysis.hasFrontend) {
    components.push({
      name: 'Frontend Application',
      type: 'frontend',
      status: 'pending',
      technology: `${analysis.framework} Application`,
      config: {
        framework: analysis.framework,
        buildCommand: 'npm run build',
        outputDir: 'dist',
        nodeVersion: '18'
      },
      logs: [{
        timestamp: new Date(),
        level: 'info',
        message: 'Frontend component initialized'
      }],
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  // API Gateway component
  if (analysis.hasBackend) {
    components.push({
      name: 'API Gateway',
      type: 'api_gateway',
      status: 'pending',
      technology: 'Express.js Backend',
      port: 3001,
      config: {
        runtime: 'Node.js',
        startCommand: 'npm start',
        healthCheckPath: '/health'
      },
      logs: [{
        timestamp: new Date(),
        level: 'info',
        message: 'API Gateway component initialized'
      }],
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  // Database component
  components.push({
    name: 'Database',
    type: 'database',
    status: 'pending',
    technology: 'MongoDB/PostgreSQL',
    config: {
      type: 'MongoDB',
      version: '6.0',
      storage: '10GB'
    },
    logs: [{
      timestamp: new Date(),
      level: 'info',
      message: 'Database component initialized'
    }],
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // Cloud Platform component
  components.push({
    name: 'Cloud Platform',
    type: 'cloud_platform',
    status: 'pending',
    technology: 'DigitalOcean/AWS',
    config: {
      provider: 'DigitalOcean',
      region: 'nyc1',
      size: 's-1vcpu-1gb'
    },
    logs: [{
      timestamp: new Date(),
      level: 'info',
      message: 'Cloud platform component initialized'
    }],
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // CI/CD Pipeline component
  components.push({
    name: 'CI/CD Pipeline',
    type: 'cicd_pipeline',
    status: 'pending',
    technology: 'GitHub Actions',
    config: {
      triggers: ['push', 'pull_request'],
      stages: ['build', 'test', 'deploy']
    },
    logs: [{
      timestamp: new Date(),
      level: 'info',
      message: 'CI/CD pipeline component initialized'
    }],
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // Security component
  components.push({
    name: 'Security',
    type: 'security',
    status: 'pending',
    technology: 'SSL/Auth/Monitoring',
    config: {
      ssl: true,
      auth: 'JWT',
      monitoring: true
    },
    logs: [{
      timestamp: new Date(),
      level: 'info',
      message: 'Security component initialized'
    }],
    createdAt: new Date(),
    updatedAt: new Date()
  });

  return components;
}

async function startDeploymentProcess(projectId: string) {
  // Simulate deployment process
  setTimeout(async () => {
    try {
      const deployment = await DeploymentArchitecture.findOne({ projectId });
      if (deployment) {
        deployment.overallStatus = 'deploying';
        await deployment.save();
      }
    } catch (error) {
      console.error('Error updating deployment status:', error);
    }
  }, 2000);
}

async function deployComponent(projectId: string, componentType: string, provider: string, region: string) {
  // Simulate component deployment
  setTimeout(async () => {
    try {
      const deployment = await DeploymentArchitecture.findOne({ projectId });
      if (deployment) {
        const component = deployment.components.find(c => c.type === componentType);
        if (component) {
          component.status = 'active';
          component.deployment = {
            provider,
            region,
            deployedAt: new Date(),
            instanceId: `${provider}-${uuidv4().slice(0, 8)}`,
            deploymentId: uuidv4()
          };
          
          if (componentType === 'frontend') {
            component.url = `https://${deployment.projectName}-frontend.${provider}.app`;
            deployment.deploymentUrl = component.url;
          } else if (componentType === 'api_gateway') {
            component.url = `https://${deployment.projectName}-api.${provider}.app`;
          }

          component.logs.push({
            timestamp: new Date(),
            level: 'info',
            message: `Component ${componentType} deployed successfully`,
            details: { provider, region, url: component.url }
          });

          await deployment.save();
        }
      }
    } catch (error) {
      console.error('Error deploying component:', error);
    }
  }, 10000); // 10 second deployment simulation
}

async function updateHealthChecks(deployment: any) {
  // Update health checks for active components
  for (const component of deployment.components) {
    if (component.status === 'active' && component.url) {
      try {
        const start = Date.now();
        await axios.get(component.url, { timeout: 5000 });
        const responseTime = Date.now() - start;
        
        component.healthCheck = {
          url: component.url,
          status: 'healthy',
          lastChecked: new Date(),
          responseTime
        };
      } catch (error) {
        component.healthCheck = {
          url: component.url,
          status: 'unhealthy',
          lastChecked: new Date()
        };
      }
    }
  }
  await deployment.save();
}

async function configureTestEmail(projectId: string, email: string) {
  // Configure SMTP settings for test email
  // This would integrate with email service providers
  console.log(`Configuring test email ${email} for project ${projectId}`);
}

export default router;
