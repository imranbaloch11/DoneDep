import express from 'express';
import axios from 'axios';
import { createError } from '../middleware/errorHandler';

const router = express.Router();

// GitHub API base URL
const GITHUB_API_BASE = 'https://api.github.com';

// Connect GitHub account
router.post('/connect', async (req, res, next) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      throw createError('Access token is required', 400);
    }

    // Get user information
    const userResponse = await axios.get(`${GITHUB_API_BASE}/user`, {
      headers: {
        'Authorization': `token ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    const user = userResponse.data;

    // Get user repositories
    const reposResponse = await axios.get(`${GITHUB_API_BASE}/user/repos`, {
      headers: {
        'Authorization': `token ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      params: {
        sort: 'updated',
        per_page: 50,
        type: 'owner'
      }
    });

    const repositories = reposResponse.data.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      language: repo.language,
      updated_at: repo.updated_at,
      clone_url: repo.clone_url,
      ssh_url: repo.ssh_url,
      default_branch: repo.default_branch,
      private: repo.private
    }));

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          login: user.login,
          name: user.name,
          avatar_url: user.avatar_url,
          public_repos: user.public_repos
        },
        repositories
      }
    });

  } catch (error) {
    console.error('GitHub connect error:', error);
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || 'GitHub API error';
      throw createError(`GitHub API Error: ${message}`, status);
    }
    next(error);
  }
});

// Analyze repository
router.post('/analyze', async (req, res, next) => {
  try {
    const { owner, repo, accessToken } = req.body;

    if (!owner || !repo || !accessToken) {
      throw createError('Owner, repo, and accessToken are required', 400);
    }

    // Get repository information
    const repoResponse = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
      headers: {
        'Authorization': `token ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    const repository = repoResponse.data;

    // Get repository contents to analyze project structure
    const contentsResponse = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents`, {
      headers: {
        'Authorization': `token ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    const contents = contentsResponse.data;

    // Analyze project structure
    const analysis = analyzeProjectStructure(contents, repository.language);

    // Try to get package.json if it exists
    let packageJson = null;
    try {
      const packageResponse = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/package.json`, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (packageResponse.data.content) {
        const content = Buffer.from(packageResponse.data.content, 'base64').toString('utf-8');
        packageJson = JSON.parse(content);
      }
    } catch (error) {
      // package.json doesn't exist, which is fine
    }

    res.json({
      success: true,
      data: {
        repository: { owner, repo },
        analysis,
        packageJson
      }
    });

  } catch (error) {
    console.error('GitHub analyze error:', error);
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || 'GitHub API error';
      throw createError(`GitHub API Error: ${message}`, status);
    }
    next(error);
  }
});

// Get deployment status
router.post('/deployment-status', async (req, res, next) => {
  try {
    const { owner, repo, accessToken } = req.body;

    if (!owner || !repo || !accessToken) {
      throw createError('Owner, repo, and accessToken are required', 400);
    }

    // Get deployments
    const deploymentsResponse = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}/deployments`, {
      headers: {
        'Authorization': `token ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    // Get workflow runs
    const workflowsResponse = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}/actions/runs`, {
      headers: {
        'Authorization': `token ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    res.json({
      success: true,
      data: {
        deployments: deploymentsResponse.data.map((deployment: any) => ({
          id: deployment.id,
          environment: deployment.environment,
          created_at: deployment.created_at,
          updated_at: deployment.updated_at
        })),
        workflowRuns: workflowsResponse.data.workflow_runs.slice(0, 10).map((run: any) => ({
          id: run.id,
          name: run.name,
          status: run.status,
          conclusion: run.conclusion,
          created_at: run.created_at,
          updated_at: run.updated_at
        }))
      }
    });

  } catch (error) {
    console.error('GitHub deployment status error:', error);
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || 'GitHub API error';
      throw createError(`GitHub API Error: ${message}`, status);
    }
    next(error);
  }
});

// Helper function to analyze project structure
function analyzeProjectStructure(contents: any[], primaryLanguage: string) {
  const files = contents.map(item => item.name.toLowerCase());
  
  // Detect project type and framework
  let projectType = 'unknown';
  let framework = null;
  const technologies = [];

  // Check for common files and frameworks
  if (files.includes('package.json')) {
    projectType = 'javascript';
    technologies.push('Node.js');

    if (files.includes('next.config.js') || files.includes('next.config.ts')) {
      framework = 'Next.js';
      technologies.push('Next.js');
    } else if (files.some(f => f.includes('react'))) {
      framework = 'React';
      technologies.push('React');
    } else if (files.includes('angular.json')) {
      framework = 'Angular';
      technologies.push('Angular');
    } else if (files.includes('vue.config.js')) {
      framework = 'Vue.js';
      technologies.push('Vue.js');
    }
  }

  if (files.includes('requirements.txt') || files.includes('pyproject.toml')) {
    projectType = 'python';
    technologies.push('Python');

    if (files.includes('manage.py')) {
      framework = 'Django';
      technologies.push('Django');
    } else if (files.includes('app.py') || files.includes('main.py')) {
      framework = 'Flask';
      technologies.push('Flask');
    }
  }

  if (files.includes('composer.json')) {
    projectType = 'php';
    technologies.push('PHP');

    if (files.includes('artisan')) {
      framework = 'Laravel';
      technologies.push('Laravel');
    }
  }

  if (files.includes('cargo.toml')) {
    projectType = 'rust';
    framework = 'Rust';
    technologies.push('Rust');
  }

  if (files.includes('go.mod')) {
    projectType = 'go';
    framework = 'Go';
    technologies.push('Go');
  }

  // Check for containerization
  const hasDockerfile = files.includes('dockerfile') || files.includes('docker-compose.yml');
  if (hasDockerfile) {
    technologies.push('Docker');
  }

  // Check for database indicators
  const hasDatabase = files.some(f => 
    f.includes('database') || 
    f.includes('migrations') || 
    f.includes('schema') ||
    f.includes('prisma') ||
    f.includes('sequelize')
  );

  // Check for monorepo
  const isMonorepo = files.includes('lerna.json') || 
                     files.includes('nx.json') || 
                     files.includes('rush.json') ||
                     files.includes('workspace');

  // Generate deployment recommendations
  const deploymentRecommendations = generateDeploymentRecommendations(
    projectType, 
    framework, 
    hasDockerfile, 
    hasDatabase
  );

  return {
    projectType,
    framework,
    technologies,
    isMonorepo,
    hasDockerfile,
    hasDatabase,
    deploymentRecommendations
  };
}

// Helper function to generate deployment recommendations
function generateDeploymentRecommendations(
  projectType: string, 
  framework: string | null, 
  hasDockerfile: boolean, 
  hasDatabase: boolean
) {
  const recommendations = [];

  if (framework === 'Next.js') {
    recommendations.push({
      platform: 'Vercel',
      reason: 'Optimized for Next.js with zero-config deployment',
      cost: 'Free tier available, $20/month for pro'
    });
    recommendations.push({
      platform: 'Netlify',
      reason: 'Great for static sites and serverless functions',
      cost: 'Free tier available, $19/month for pro'
    });
  }

  if (projectType === 'javascript' || projectType === 'python') {
    recommendations.push({
      platform: 'Railway',
      reason: 'Simple deployment with database support',
      cost: '$5/month per service'
    });
    recommendations.push({
      platform: 'DigitalOcean App Platform',
      reason: 'Managed platform with good pricing',
      cost: '$5-12/month depending on resources'
    });
  }

  if (hasDockerfile) {
    recommendations.push({
      platform: 'Google Cloud Run',
      reason: 'Serverless containers with pay-per-use pricing',
      cost: 'Pay per request, very cost-effective'
    });
    recommendations.push({
      platform: 'AWS ECS',
      reason: 'Scalable container orchestration',
      cost: 'Variable based on usage'
    });
  }

  if (hasDatabase) {
    recommendations.push({
      platform: 'PlanetScale',
      reason: 'Serverless MySQL with branching',
      cost: 'Free tier available, $29/month for production'
    });
    recommendations.push({
      platform: 'Supabase',
      reason: 'PostgreSQL with real-time features',
      cost: 'Free tier available, $25/month for pro'
    });
  }

  return recommendations;
}

export default router;
