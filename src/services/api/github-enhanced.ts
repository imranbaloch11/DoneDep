import { apiClient } from './client';

export interface RepositoryAnalysis {
  framework: string;
  hasBackend: boolean;
  hasFrontend: boolean;
  hasDatabase: boolean;
  deploymentReady: boolean;
  packageManager: string;
  buildCommand: string | null;
  startCommand: string | null;
  dependencies: string[];
  devDependencies: string[];
  scripts: Record<string, string>;
  deploymentConfigs: {
    hasDockerfile: boolean;
    hasDockerCompose: boolean;
    hasVercelConfig: boolean;
    hasNetlifyConfig: boolean;
    hasGitHubActions: boolean;
  };
  projectStructure: {
    hasPackageJson: boolean;
    hasReadme: boolean;
    hasGitignore: boolean;
    hasEnvExample: boolean;
    folders: string[];
  };
  errors?: string[];
}

export interface EnhancedRepository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  clone_url: string;
  html_url: string;
  language: string;
  size: number;
  updated_at: string;
  private: boolean;
  fork: boolean;
  archived: boolean;
  disabled: boolean;
  default_branch: string;
  topics: string[];
  analysis: RepositoryAnalysis;
}

export interface GitHubUser {
  id: number;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
  public_repos: number;
  private_repos: number;
}

export interface DeploymentRecommendation {
  type: 'quick_deploy' | 'architecture_improvement' | 'cicd_setup';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  repository?: EnhancedRepository;
  repositories?: EnhancedRepository[];
  estimatedTime?: string;
  platform?: string;
  benefits?: string[];
}

export interface RepositorySummary {
  total: number;
  deployable: number;
  frameworks: Record<string, number>;
  languages: Record<string, number>;
}

export interface EnhancedGitHubResponse {
  success: boolean;
  user: GitHubUser;
  repositories: EnhancedRepository[];
  summary: RepositorySummary;
  recommendations: DeploymentRecommendation[];
}

export const githubEnhancedAPI = {
  // Connect GitHub with enhanced analysis
  async connectEnhanced(token: string): Promise<EnhancedGitHubResponse> {
    const response = await apiClient.post('/github-enhanced/connect-enhanced', { token });
    return response.data;
  },

  // Get deployment readiness score for repositories
  getDeploymentScore(repositories: EnhancedRepository[]): {
    ready: EnhancedRepository[];
    needsWork: EnhancedRepository[];
    notReady: EnhancedRepository[];
  } {
    const ready = repositories.filter(repo => repo.analysis.deploymentReady);
    const needsWork = repositories.filter(repo => 
      !repo.analysis.deploymentReady && 
      (repo.analysis.hasFrontend || repo.analysis.hasBackend) &&
      repo.analysis.framework !== 'Unknown'
    );
    const notReady = repositories.filter(repo => 
      !repo.analysis.deploymentReady && 
      (!repo.analysis.hasFrontend && !repo.analysis.hasBackend) ||
      repo.analysis.framework === 'Unknown'
    );

    return { ready, needsWork, notReady };
  },

  // Get framework-specific deployment instructions
  getDeploymentInstructions(repository: EnhancedRepository): {
    platform: string;
    steps: string[];
    buildCommand: string;
    startCommand: string;
    envVars: string[];
  } {
    const { analysis } = repository;
    
    let platform = 'Vercel';
    let envVars: string[] = [];
    
    // Determine best platform
    if (analysis.framework === 'Next.js') {
      platform = 'Vercel';
      envVars = ['NEXT_PUBLIC_API_URL'];
    } else if (analysis.framework === 'React' || analysis.framework === 'Create React App') {
      platform = 'Netlify';
      envVars = ['REACT_APP_API_URL'];
    } else if (analysis.framework === 'Vue.js') {
      platform = 'Netlify';
      envVars = ['VUE_APP_API_URL'];
    } else if (analysis.hasBackend && analysis.hasFrontend) {
      platform = 'Railway';
      envVars = ['DATABASE_URL', 'JWT_SECRET', 'API_URL'];
    } else if (analysis.hasBackend) {
      platform = 'Railway';
      envVars = ['DATABASE_URL', 'PORT'];
    }

    // Generate deployment steps
    const steps = this.generateDeploymentSteps(platform, analysis);

    return {
      platform,
      steps,
      buildCommand: analysis.buildCommand || 'npm run build',
      startCommand: analysis.startCommand || 'npm start',
      envVars
    };
  },

  // Generate step-by-step deployment instructions
  generateDeploymentSteps(platform: string, analysis: RepositoryAnalysis): string[] {
    const steps: string[] = [];

    // Common preparation steps
    steps.push('Ensure your repository is up to date');
    
    if (!analysis.projectStructure.hasEnvExample) {
      steps.push('Create .env.example file with required environment variables');
    }

    if (!analysis.projectStructure.hasReadme) {
      steps.push('Add README.md with project description and setup instructions');
    }

    // Platform-specific steps
    switch (platform) {
      case 'Vercel':
        steps.push('Connect your GitHub repository to Vercel');
        steps.push('Configure build settings (usually auto-detected)');
        if (analysis.hasDatabase) {
          steps.push('Set up database connection in environment variables');
        }
        steps.push('Deploy with automatic CI/CD');
        break;

      case 'Netlify':
        steps.push('Connect your GitHub repository to Netlify');
        steps.push('Set build command and publish directory');
        steps.push('Configure environment variables');
        steps.push('Enable automatic deployments');
        break;

      case 'Railway':
        steps.push('Connect your GitHub repository to Railway');
        steps.push('Configure start command');
        if (analysis.hasDatabase) {
          steps.push('Provision database service');
          steps.push('Connect database to your application');
        }
        steps.push('Set environment variables');
        steps.push('Deploy with Railway');
        break;

      default:
        steps.push('Choose a deployment platform');
        steps.push('Configure build and start commands');
        steps.push('Set up environment variables');
        steps.push('Deploy your application');
    }

    return steps;
  },

  // Analyze repository architecture and suggest improvements
  analyzeArchitecture(repository: EnhancedRepository): {
    currentArchitecture: string;
    recommendations: string[];
    benefits: string[];
  } {
    const { analysis } = repository;
    
    let currentArchitecture = 'Unknown';
    const recommendations: string[] = [];
    const benefits: string[] = [];

    // Determine current architecture
    if (analysis.hasBackend && analysis.hasFrontend) {
      currentArchitecture = 'Monorepo (Frontend + Backend)';
      
      recommendations.push('Consider splitting into separate repositories');
      recommendations.push('Use microservices architecture for better scalability');
      recommendations.push('Implement API versioning');
      
      benefits.push('Independent deployment cycles');
      benefits.push('Better team collaboration');
      benefits.push('Easier scaling of individual components');
    } else if (analysis.hasFrontend) {
      currentArchitecture = 'Frontend Application';
      
      if (!analysis.hasBackend) {
        recommendations.push('Consider adding a backend API');
        recommendations.push('Implement user authentication');
        recommendations.push('Add database integration');
      }
    } else if (analysis.hasBackend) {
      currentArchitecture = 'Backend API';
      
      recommendations.push('Add comprehensive API documentation');
      recommendations.push('Implement rate limiting');
      recommendations.push('Add health check endpoints');
    }

    // Database recommendations
    if (!analysis.hasDatabase && (analysis.hasBackend || analysis.hasFrontend)) {
      recommendations.push('Consider adding database integration');
      benefits.push('Persistent data storage');
      benefits.push('Better user experience');
    }

    // CI/CD recommendations
    if (!analysis.deploymentConfigs.hasGitHubActions) {
      recommendations.push('Set up GitHub Actions for CI/CD');
      benefits.push('Automated testing and deployment');
      benefits.push('Consistent deployment process');
    }

    return {
      currentArchitecture,
      recommendations,
      benefits
    };
  },

  // Get deployment cost estimates
  getDeploymentCostEstimate(repository: EnhancedRepository): {
    platform: string;
    monthlyEstimate: string;
    breakdown: Array<{ service: string; cost: string; description: string }>;
  } {
    const { analysis } = repository;
    const breakdown: Array<{ service: string; cost: string; description: string }> = [];
    
    let platform = 'Vercel';
    let totalCost = 0;

    if (analysis.framework === 'Next.js') {
      platform = 'Vercel';
      breakdown.push({
        service: 'Vercel Pro',
        cost: '$20/month',
        description: 'Hosting, serverless functions, analytics'
      });
      totalCost += 20;
    } else if (analysis.hasBackend && analysis.hasFrontend) {
      platform = 'Railway';
      breakdown.push({
        service: 'Railway Starter',
        cost: '$5/month',
        description: 'Web service hosting'
      });
      totalCost += 5;
    } else {
      platform = 'Netlify';
      breakdown.push({
        service: 'Netlify Pro',
        cost: '$19/month',
        description: 'Static site hosting, forms, analytics'
      });
      totalCost += 19;
    }

    if (analysis.hasDatabase) {
      breakdown.push({
        service: 'Database',
        cost: '$5-15/month',
        description: 'Managed database service'
      });
      totalCost += 10; // Average
    }

    if (analysis.deploymentConfigs.hasGitHubActions) {
      breakdown.push({
        service: 'GitHub Actions',
        cost: 'Free/Included',
        description: 'CI/CD pipeline (2000 minutes/month free)'
      });
    }

    return {
      platform,
      monthlyEstimate: `$${totalCost}/month`,
      breakdown
    };
  }
};

// Helper functions for UI components
export const getFrameworkIcon = (framework: string): string => {
  switch (framework) {
    case 'Next.js': return '⚡';
    case 'React': return '⚛️';
    case 'Vue.js': return '💚';
    case 'Angular': return '🅰️';
    case 'Svelte': return '🧡';
    case 'Express.js': return '🚀';
    case 'Gatsby': return '🍃';
    case 'Astro': return '🚀';
    default: return '📦';
  }
};

export const getDeploymentReadinessColor = (ready: boolean): string => {
  return ready ? 'text-green-600 bg-green-100' : 'text-yellow-600 bg-yellow-100';
};

export const getPlatformIcon = (platform: string): string => {
  switch (platform) {
    case 'Vercel': return '▲';
    case 'Netlify': return '🌐';
    case 'Railway': return '🚂';
    case 'Heroku': return '🟣';
    default: return '☁️';
  }
};
