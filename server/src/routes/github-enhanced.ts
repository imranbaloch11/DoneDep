import express from 'express';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { createError } from '../middleware/errorHandler';

const router = express.Router();

// Enhanced GitHub integration with repository fetching and analysis
router.post('/connect-enhanced', async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      throw createError('GitHub token is required', 400);
    }

    // Verify token and get user info
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    const user = userResponse.data;

    // Fetch all user repositories
    const reposResponse = await axios.get('https://api.github.com/user/repos', {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      params: {
        sort: 'updated',
        per_page: 100,
        affiliation: 'owner,collaborator'
      }
    });

    const repositories = reposResponse.data;

    // Analyze each repository for deployment potential
    const analyzedRepos = await Promise.all(
      repositories.map(async (repo: any) => {
        try {
          const analysis = await analyzeRepository(token, repo.owner.login, repo.name);
          return {
            id: repo.id,
            name: repo.name,
            full_name: repo.full_name,
            description: repo.description,
            clone_url: repo.clone_url,
            html_url: repo.html_url,
            language: repo.language,
            size: repo.size,
            updated_at: repo.updated_at,
            private: repo.private,
            fork: repo.fork,
            archived: repo.archived,
            disabled: repo.disabled,
            default_branch: repo.default_branch,
            topics: repo.topics || [],
            analysis: analysis
          };
        } catch (error) {
          console.error(`Error analyzing repository ${repo.name}:`, error);
          return {
            id: repo.id,
            name: repo.name,
            full_name: repo.full_name,
            description: repo.description,
            clone_url: repo.clone_url,
            html_url: repo.html_url,
            language: repo.language,
            size: repo.size,
            updated_at: repo.updated_at,
            private: repo.private,
            fork: repo.fork,
            archived: repo.archived,
            disabled: repo.disabled,
            default_branch: repo.default_branch,
            topics: repo.topics || [],
            analysis: {
              framework: 'Unknown',
              hasBackend: false,
              hasFrontend: false,
              hasDatabase: false,
              deploymentReady: false,
              packageManager: 'unknown',
              buildCommand: null,
              startCommand: null,
              dependencies: [],
              devDependencies: [],
              scripts: {},
              errors: ['Analysis failed']
            }
          };
        }
      })
    );

    // Filter and sort repositories by deployment potential
    const deployableRepos = analyzedRepos
      .filter(repo => !repo.fork && !repo.archived && !repo.disabled)
      .sort((a, b) => {
        // Sort by deployment readiness, then by recent updates
        if (a.analysis.deploymentReady !== b.analysis.deploymentReady) {
          return b.analysis.deploymentReady ? 1 : -1;
        }
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });

    // Generate deployment recommendations
    const recommendations = generateDeploymentRecommendations(deployableRepos);

    res.json({
      success: true,
      user: {
        id: user.id,
        login: user.login,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        public_repos: user.public_repos,
        private_repos: user.total_private_repos
      },
      repositories: deployableRepos,
      summary: {
        total: repositories.length,
        deployable: deployableRepos.length,
        frameworks: getFrameworkSummary(deployableRepos),
        languages: getLanguageSummary(deployableRepos)
      },
      recommendations
    });

  } catch (error) {
    console.error('GitHub enhanced connect error:', error);
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw createError('Invalid GitHub token', 401);
    }
    next(error);
  }
});

// Analyze repository structure and deployment readiness
async function analyzeRepository(token: string, owner: string, repo: string) {
  try {
    // Get repository contents
    const contentsResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    const contents = contentsResponse.data;
    const fileNames = contents.map((item: any) => item.name.toLowerCase());

    // Analyze package.json for Node.js projects
    let packageJson = null;
    let dependencies: string[] = [];
    let devDependencies: string[] = [];
    let scripts: Record<string, string> = {};

    if (fileNames.includes('package.json')) {
      try {
        const packageResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/package.json`, {
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });

        const packageContent = Buffer.from(packageResponse.data.content, 'base64').toString('utf-8');
        packageJson = JSON.parse(packageContent);
        dependencies = Object.keys(packageJson.dependencies || {});
        devDependencies = Object.keys(packageJson.devDependencies || {});
        scripts = packageJson.scripts || {};
      } catch (error) {
        console.error('Error parsing package.json:', error);
      }
    }

    // Detect framework and project type
    const framework = detectFramework(fileNames, dependencies, devDependencies);
    const hasBackend = detectBackend(fileNames, dependencies, contents);
    const hasFrontend = detectFrontend(fileNames, dependencies, framework);
    const hasDatabase = detectDatabase(fileNames, dependencies);
    const packageManager = detectPackageManager(fileNames);

    // Determine deployment readiness
    const deploymentReady = determineDeploymentReadiness(
      framework,
      hasBackend,
      hasFrontend,
      scripts,
      fileNames
    );

    // Get build and start commands
    const buildCommand = getBuildCommand(scripts, framework);
    const startCommand = getStartCommand(scripts, framework);

    // Check for deployment configurations
    const hasDockerfile = fileNames.includes('dockerfile');
    const hasDockerCompose = fileNames.includes('docker-compose.yml') || fileNames.includes('docker-compose.yaml');
    const hasVercelConfig = fileNames.includes('vercel.json');
    const hasNetlifyConfig = fileNames.includes('netlify.toml') || fileNames.includes('_redirects');
    const hasGitHubActions = contents.some((item: any) => item.name === '.github');

    return {
      framework,
      hasBackend,
      hasFrontend,
      hasDatabase,
      deploymentReady,
      packageManager,
      buildCommand,
      startCommand,
      dependencies,
      devDependencies,
      scripts,
      deploymentConfigs: {
        hasDockerfile,
        hasDockerCompose,
        hasVercelConfig,
        hasNetlifyConfig,
        hasGitHubActions
      },
      projectStructure: {
        hasPackageJson: fileNames.includes('package.json'),
        hasReadme: fileNames.includes('readme.md'),
        hasGitignore: fileNames.includes('.gitignore'),
        hasEnvExample: fileNames.includes('.env.example'),
        folders: contents.filter((item: any) => item.type === 'dir').map((item: any) => item.name)
      }
    };

  } catch (error) {
    console.error(`Error analyzing repository ${owner}/${repo}:`, error);
    throw error;
  }
}

// Framework detection logic
function detectFramework(fileNames: string[], dependencies: string[], devDependencies: string[]): string {
  const allDeps = [...dependencies, ...devDependencies];

  // Next.js
  if (allDeps.includes('next') || fileNames.includes('next.config.js') || fileNames.includes('next.config.ts')) {
    return 'Next.js';
  }

  // React
  if (allDeps.includes('react')) {
    if (allDeps.includes('react-scripts')) {
      return 'Create React App';
    }
    if (allDeps.includes('vite')) {
      return 'React + Vite';
    }
    return 'React';
  }

  // Vue.js
  if (allDeps.includes('vue')) {
    if (allDeps.includes('nuxt')) {
      return 'Nuxt.js';
    }
    return 'Vue.js';
  }

  // Angular
  if (allDeps.includes('@angular/core') || fileNames.includes('angular.json')) {
    return 'Angular';
  }

  // Svelte
  if (allDeps.includes('svelte')) {
    if (allDeps.includes('@sveltejs/kit')) {
      return 'SvelteKit';
    }
    return 'Svelte';
  }

  // Express.js
  if (allDeps.includes('express')) {
    return 'Express.js';
  }

  // Gatsby
  if (allDeps.includes('gatsby')) {
    return 'Gatsby';
  }

  // Astro
  if (allDeps.includes('astro')) {
    return 'Astro';
  }

  // Static site generators
  if (fileNames.includes('_config.yml')) {
    return 'Jekyll';
  }

  if (fileNames.includes('config.toml') || fileNames.includes('config.yaml')) {
    return 'Hugo';
  }

  // Python frameworks
  if (fileNames.includes('requirements.txt') || fileNames.includes('pyproject.toml')) {
    return 'Python';
  }

  // PHP
  if (fileNames.includes('composer.json')) {
    return 'PHP';
  }

  // Go
  if (fileNames.includes('go.mod')) {
    return 'Go';
  }

  // Rust
  if (fileNames.includes('cargo.toml')) {
    return 'Rust';
  }

  return 'Unknown';
}

// Backend detection
function detectBackend(fileNames: string[], dependencies: string[], contents: any[]): boolean {
  const allDeps = dependencies;

  // Node.js backend indicators
  if (allDeps.includes('express') || 
      allDeps.includes('fastify') || 
      allDeps.includes('koa') || 
      allDeps.includes('hapi')) {
    return true;
  }

  // API folders
  const folders = contents.filter(item => item.type === 'dir').map(item => item.name.toLowerCase());
  if (folders.includes('api') || 
      folders.includes('server') || 
      folders.includes('backend') ||
      folders.includes('src/api')) {
    return true;
  }

  // Server files
  if (fileNames.includes('server.js') || 
      fileNames.includes('server.ts') || 
      fileNames.includes('app.js') || 
      fileNames.includes('app.ts')) {
    return true;
  }

  return false;
}

// Frontend detection
function detectFrontend(fileNames: string[], dependencies: string[], framework: string): boolean {
  if (framework === 'Next.js' || 
      framework === 'React' || 
      framework === 'Create React App' || 
      framework === 'Vue.js' || 
      framework === 'Angular' || 
      framework === 'Svelte' || 
      framework === 'Gatsby' || 
      framework === 'Astro') {
    return true;
  }

  // Static files
  if (fileNames.includes('index.html')) {
    return true;
  }

  return false;
}

// Database detection
function detectDatabase(fileNames: string[], dependencies: string[]): boolean {
  const dbDeps = [
    'mongoose', 'mongodb', 'pg', 'mysql', 'mysql2', 'sqlite3', 
    'prisma', 'typeorm', 'sequelize', 'knex'
  ];

  return dependencies.some(dep => dbDeps.includes(dep)) ||
         fileNames.includes('prisma') ||
         fileNames.includes('schema.prisma');
}

// Package manager detection
function detectPackageManager(fileNames: string[]): string {
  if (fileNames.includes('yarn.lock')) return 'yarn';
  if (fileNames.includes('pnpm-lock.yaml')) return 'pnpm';
  if (fileNames.includes('package-lock.json')) return 'npm';
  if (fileNames.includes('package.json')) return 'npm';
  return 'unknown';
}

// Deployment readiness assessment
function determineDeploymentReadiness(
  framework: string,
  hasBackend: boolean,
  hasFrontend: boolean,
  scripts: Record<string, string>,
  fileNames: string[]
): boolean {
  // Must have a recognizable framework
  if (framework === 'Unknown') return false;

  // Must have either frontend or backend
  if (!hasBackend && !hasFrontend) return false;

  // Must have build script for frontend projects
  if (hasFrontend && !scripts.build && framework !== 'Static') return false;

  // Must have start script for backend projects
  if (hasBackend && !scripts.start && !scripts.dev) return false;

  // Must have package.json for Node.js projects
  if ((hasBackend || hasFrontend) && !fileNames.includes('package.json')) return false;

  return true;
}

// Get build command
function getBuildCommand(scripts: Record<string, string>, framework: string): string | null {
  if (scripts.build) return 'npm run build';
  
  // Framework-specific defaults
  switch (framework) {
    case 'Next.js':
      return 'next build';
    case 'Create React App':
      return 'react-scripts build';
    case 'Vue.js':
      return 'vue-cli-service build';
    case 'Angular':
      return 'ng build';
    default:
      return null;
  }
}

// Get start command
function getStartCommand(scripts: Record<string, string>, framework: string): string | null {
  if (scripts.start) return 'npm start';
  if (scripts.dev) return 'npm run dev';
  
  // Framework-specific defaults
  switch (framework) {
    case 'Next.js':
      return 'next start';
    case 'Express.js':
      return 'node server.js';
    default:
      return null;
  }
}

// Generate deployment recommendations
function generateDeploymentRecommendations(repositories: any[]) {
  const recommendations = [];

  // Find the most deployment-ready repository
  const readyRepos = repositories.filter(repo => repo.analysis.deploymentReady);
  
  if (readyRepos.length > 0) {
    const topRepo = readyRepos[0];
    recommendations.push({
      type: 'quick_deploy',
      priority: 'high',
      title: `Deploy ${topRepo.name} Now`,
      description: `${topRepo.name} is ready for deployment with ${topRepo.analysis.framework}`,
      repository: topRepo,
      estimatedTime: '5-10 minutes',
      platform: recommendPlatform(topRepo.analysis)
    });
  }

  // Recommend architecture improvements
  const monoRepos = repositories.filter(repo => 
    repo.analysis.hasBackend && repo.analysis.hasFrontend
  );

  if (monoRepos.length > 0) {
    recommendations.push({
      type: 'architecture_improvement',
      priority: 'medium',
      title: 'Split Monorepo for Better Deployment',
      description: 'Consider separating frontend and backend into different repositories',
      repositories: monoRepos.slice(0, 3),
      benefits: ['Independent scaling', 'Faster deployments', 'Better CI/CD']
    });
  }

  // Recommend CI/CD setup
  const reposWithoutCI = repositories.filter(repo => 
    repo.analysis.deploymentReady && !repo.analysis.deploymentConfigs.hasGitHubActions
  );

  if (reposWithoutCI.length > 0) {
    recommendations.push({
      type: 'cicd_setup',
      priority: 'medium',
      title: 'Set Up Automated Deployments',
      description: 'Add GitHub Actions for continuous deployment',
      repositories: reposWithoutCI.slice(0, 5)
    });
  }

  return recommendations;
}

// Recommend deployment platform
function recommendPlatform(analysis: any): string {
  if (analysis.framework === 'Next.js') return 'Vercel';
  if (analysis.framework === 'React' || analysis.framework === 'Create React App') return 'Netlify';
  if (analysis.framework === 'Gatsby') return 'Netlify';
  if (analysis.hasBackend && analysis.hasFrontend) return 'Railway';
  if (analysis.hasBackend) return 'Railway';
  return 'Vercel';
}

// Get framework summary
function getFrameworkSummary(repositories: any[]) {
  const frameworks: Record<string, number> = {};
  repositories.forEach(repo => {
    const framework = repo.analysis.framework;
    frameworks[framework] = (frameworks[framework] || 0) + 1;
  });
  return frameworks;
}

// Get language summary
function getLanguageSummary(repositories: any[]) {
  const languages: Record<string, number> = {};
  repositories.forEach(repo => {
    if (repo.language) {
      languages[repo.language] = (languages[repo.language] || 0) + 1;
    }
  });
  return languages;
}

export default router;
