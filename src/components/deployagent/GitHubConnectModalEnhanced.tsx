'use client';

import React, { useState, useEffect } from 'react';
import { X, Github, Loader2, Search, Star, GitBranch, Calendar, ExternalLink, Zap, CheckCircle, AlertCircle, Clock, TrendingUp, BarChart3 } from 'lucide-react';
import { githubEnhancedAPI, EnhancedRepository, DeploymentRecommendation, getFrameworkIcon, getDeploymentReadinessColor, getPlatformIcon } from '../../services/api/github-enhanced';
import { toast } from 'react-hot-toast';

interface GitHubConnectModalEnhancedProps {
  isOpen: boolean;
  onClose: () => void;
  onRepositorySelect: (repository: EnhancedRepository) => void;
}

export default function GitHubConnectModalEnhanced({ 
  isOpen, 
  onClose, 
  onRepositorySelect 
}: GitHubConnectModalEnhancedProps) {
  const [step, setStep] = useState<'auth' | 'repos'>('auth');
  const [isLoading, setIsLoading] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [repositories, setRepositories] = useState<EnhancedRepository[]>([]);
  const [filteredRepositories, setFilteredRepositories] = useState<EnhancedRepository[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<EnhancedRepository | null>(null);
  const [recommendations, setRecommendations] = useState<DeploymentRecommendation[]>([]);
  const [repositorySummary, setRepositorySummary] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'repositories' | 'recommendations' | 'summary'>('repositories');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setStep('auth');
      setAccessToken('');
      setUser(null);
      setRepositories([]);
      setSelectedRepo(null);
      setRecommendations([]);
      setRepositorySummary(null);
      setActiveTab('repositories');
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = repositories.filter(repo =>
        repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repo.language?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repo.analysis.framework.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRepositories(filtered);
    } else {
      setFilteredRepositories(repositories);
    }
  }, [searchTerm, repositories]);

  const handleConnect = async () => {
    if (!accessToken.trim()) {
      toast.error('Please enter your GitHub personal access token');
      return;
    }

    setIsLoading(true);
    try {
      const response = await githubEnhancedAPI.connectEnhanced(accessToken);
      
      if (response.success) {
        setUser(response.user);
        setRepositories(response.repositories);
        setFilteredRepositories(response.repositories);
        setRecommendations(response.recommendations);
        setRepositorySummary(response.summary);
        setStep('repos');
        toast.success(`Connected! Found ${response.repositories.length} repositories`);
      }
    } catch (error) {
      console.error('GitHub connection error:', error);
      toast.error('Failed to connect to GitHub. Please check your token.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRepository = (repository: EnhancedRepository) => {
    setSelectedRepo(repository);
    onRepositorySelect(repository);
    onClose();
    toast.success(`Selected repository: ${repository.name}`);
  };

  const getDeploymentReadinessIcon = (ready: boolean) => {
    return ready ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <Clock className="w-4 h-4 text-yellow-600" />
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Github className="w-6 h-6 text-gray-700 mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {step === 'auth' ? 'Connect GitHub Account' : 'Select Repository'}
              </h2>
              <p className="text-sm text-gray-600">
                {step === 'auth' 
                  ? 'Enter your GitHub personal access token to analyze repositories'
                  : `Found ${repositories.length} repositories with deployment analysis`
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {step === 'auth' ? (
            /* Authentication Step */
            <div className="p-6 space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">How to get your GitHub token:</h3>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Go to GitHub Settings → Developer settings → Personal access tokens</li>
                  <li>2. Click "Generate new token (classic)"</li>
                  <li>3. Select scopes: <code className="bg-blue-100 px-1 rounded">repo</code>, <code className="bg-blue-100 px-1 rounded">read:user</code></li>
                  <li>4. Copy the generated token</li>
                </ol>
              </div>

              <div>
                <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
                  Personal Access Token
                </label>
                <input
                  id="token"
                  type="password"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleConnect}
                disabled={isLoading || !accessToken.trim()}
                className="w-full flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4 mr-2" />
                    Analyzing repositories...
                  </>
                ) : (
                  <>
                    <Github className="w-4 h-4 mr-2" />
                    Connect & Analyze
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Repository Selection Step */
            <div className="flex flex-col h-full">
              {/* User Info & Summary */}
              {user && repositorySummary && (
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <img 
                        src={user.avatar_url} 
                        alt={user.name} 
                        className="w-8 h-8 rounded-full mr-3"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">{user.name || user.login}</h3>
                        <p className="text-sm text-gray-600">{user.public_repos + user.private_repos} repositories</p>
                      </div>
                    </div>
                    <div className="flex space-x-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-green-600">{repositorySummary.deployable}</div>
                        <div className="text-gray-600">Ready</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-blue-600">{Object.keys(repositorySummary.frameworks).length}</div>
                        <div className="text-gray-600">Frameworks</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('repositories')}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'repositories'
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Repositories ({repositories.length})
                </button>
                <button
                  onClick={() => setActiveTab('recommendations')}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'recommendations'
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Recommendations ({recommendations.length})
                </button>
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'summary'
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Summary
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-hidden">
                {activeTab === 'repositories' && (
                  <div className="h-full flex flex-col">
                    {/* Search */}
                    <div className="p-4 border-b border-gray-200">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search repositories by name, description, or framework..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Repository List */}
                    <div className="flex-1 overflow-y-auto">
                      {filteredRepositories.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          <div className="text-center">
                            <Github className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p>No repositories found</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2 p-4">
                          {filteredRepositories.map((repo) => (
                            <div
                              key={repo.id}
                              onClick={() => handleSelectRepository(repo)}
                              className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-colors"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center mb-2">
                                    <span className="text-lg mr-2">{getFrameworkIcon(repo.analysis.framework)}</span>
                                    <h3 className="font-semibold text-gray-900">{repo.name}</h3>
                                    {repo.private && (
                                      <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                                        Private
                                      </span>
                                    )}
                                    <div className="ml-2 flex items-center">
                                      {getDeploymentReadinessIcon(repo.analysis.deploymentReady)}
                                      <span className={`ml-1 text-xs px-2 py-1 rounded ${getDeploymentReadinessColor(repo.analysis.deploymentReady)}`}>
                                        {repo.analysis.deploymentReady ? 'Ready' : 'Needs Setup'}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <p className="text-sm text-gray-600 mb-2">
                                    {repo.description || 'No description available'}
                                  </p>
                                  
                                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                                    <span className="flex items-center">
                                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                                      {repo.analysis.framework}
                                    </span>
                                    {repo.language && (
                                      <span>{repo.language}</span>
                                    )}
                                    <span className="flex items-center">
                                      <Calendar className="w-3 h-3 mr-1" />
                                      {new Date(repo.updated_at).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center">
                                      <span className="text-lg mr-1">{getPlatformIcon(githubEnhancedAPI.getDeploymentInstructions(repo).platform)}</span>
                                      {githubEnhancedAPI.getDeploymentInstructions(repo).platform}
                                    </span>
                                  </div>

                                  {/* Deployment Features */}
                                  <div className="flex items-center space-x-2 mt-2">
                                    {repo.analysis.hasFrontend && (
                                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Frontend</span>
                                    )}
                                    {repo.analysis.hasBackend && (
                                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Backend</span>
                                    )}
                                    {repo.analysis.hasDatabase && (
                                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">Database</span>
                                    )}
                                    {repo.analysis.deploymentConfigs.hasGitHubActions && (
                                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">CI/CD</span>
                                    )}
                                  </div>
                                </div>
                                
                                <ExternalLink className="w-4 h-4 text-gray-400 ml-4 flex-shrink-0" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'recommendations' && (
                  <div className="p-4 space-y-4 overflow-y-auto">
                    {recommendations.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p>No recommendations available</p>
                      </div>
                    ) : (
                      recommendations.map((rec, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                            <span className={`px-2 py-1 text-xs rounded ${
                              rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                              rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {rec.priority} priority
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                          
                          {rec.repository && (
                            <button
                              onClick={() => handleSelectRepository(rec.repository!)}
                              className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                            >
                              Select {rec.repository.name} →
                            </button>
                          )}
                          
                          {rec.benefits && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500 mb-1">Benefits:</p>
                              <ul className="text-xs text-gray-600 space-y-1">
                                {rec.benefits.map((benefit, i) => (
                                  <li key={i}>• {benefit}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'summary' && repositorySummary && (
                  <div className="p-4 space-y-6 overflow-y-auto">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Framework Distribution</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(repositorySummary.frameworks).map(([framework, count]) => (
                          <div key={framework} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                              <span className="text-lg mr-2">{getFrameworkIcon(framework)}</span>
                              <span className="text-sm font-medium">{framework}</span>
                            </div>
                            <span className="text-sm text-gray-600">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Language Distribution</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(repositorySummary.languages).map(([language, count]) => (
                          <div key={language} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium">{language}</span>
                            <span className="text-sm text-gray-600">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-900 mb-2">Deployment Readiness</h3>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-green-600">{repositorySummary.deployable}</div>
                          <div className="text-sm text-gray-600">Ready to Deploy</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-yellow-600">
                            {repositories.filter(r => !r.analysis.deploymentReady && r.analysis.framework !== 'Unknown').length}
                          </div>
                          <div className="text-sm text-gray-600">Need Setup</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-600">
                            {repositories.filter(r => r.analysis.framework === 'Unknown').length}
                          </div>
                          <div className="text-sm text-gray-600">Unknown</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
