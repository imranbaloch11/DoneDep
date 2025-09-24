'use client';

import React, { useState, useEffect } from 'react';
import { X, Github, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { githubApi } from '../../services/api/github';
import { toast } from 'react-hot-toast';

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  language: string;
  updated_at: string;
  private: boolean;
}

interface GitHubUser {
  id: number;
  login: string;
  name: string;
  avatar_url: string;
  public_repos: number;
}

interface GitHubConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRepositorySelect?: (repository: Repository) => void;
}

export default function GitHubConnectModal({ 
  isOpen, 
  onClose, 
  onRepositorySelect 
}: GitHubConnectModalProps) {
  const [step, setStep] = useState<'auth' | 'repos' | 'analysis'>('auth');
  const [isLoading, setIsLoading] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setStep('auth');
      setAccessToken('');
      setUser(null);
      setRepositories([]);
      setSelectedRepo(null);
      setAnalysis(null);
    }
  }, [isOpen]);

  const handleConnect = async () => {
    if (!accessToken.trim()) {
      toast.error('Please enter your GitHub access token');
      return;
    }

    setIsLoading(true);
    try {
      const response = await githubApi.connect({ accessToken });
      
      if (response.success && response.data) {
        setUser(response.data.user);
        setRepositories(response.data.repositories);
        setStep('repos');
        toast.success(`Connected as ${response.data.user.login}`);
      } else {
        toast.error(response.message || 'Failed to connect to GitHub');
      }
    } catch (error) {
      console.error('GitHub connection error:', error);
      toast.error('Failed to connect to GitHub. Please check your token.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRepositorySelect = async (repository: Repository) => {
    setSelectedRepo(repository);
    setIsLoading(true);

    try {
      const [owner, repo] = repository.full_name.split('/');
      const response = await githubApi.analyzeRepository({
        owner,
        repo,
        accessToken
      });

      if (response.success && response.data) {
        setAnalysis(response.data.analysis);
        setStep('analysis');
        toast.success('Repository analyzed successfully');
      } else {
        toast.error(response.message || 'Failed to analyze repository');
      }
    } catch (error) {
      console.error('Repository analysis error:', error);
      toast.error('Failed to analyze repository');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRepository = () => {
    if (selectedRepo && onRepositorySelect) {
      onRepositorySelect(selectedRepo);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Github className="h-6 w-6 text-gray-900" />
              <h2 className="text-xl font-semibold text-gray-900">
                Connect GitHub Repository
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {step === 'auth' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    GitHub Access Token
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Enter your GitHub personal access token to connect your repositories.
                    You can create one in your GitHub Settings → Developer settings → Personal access tokens.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
                        Access Token
                      </label>
                      <input
                        id="token"
                        type="password"
                        value={accessToken}
                        onChange={(e) => setAccessToken(e.target.value)}
                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-md">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">Required Permissions:</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• repo (Full control of private repositories)</li>
                        <li>• read:user (Read user profile data)</li>
                        <li>• workflow (Update GitHub Action workflows)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConnect}
                    disabled={isLoading || !accessToken.trim()}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Connect GitHub
                  </button>
                </div>
              </div>
            )}

            {step === 'repos' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-md">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-900">
                      Connected as {user?.login}
                    </p>
                    <p className="text-sm text-green-700">
                      {repositories.length} repositories found
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Select Repository
                  </h3>
                  
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {repositories.map((repo) => (
                      <div
                        key={repo.id}
                        onClick={() => handleRepositorySelect(repo)}
                        className="p-4 border border-gray-200 rounded-md hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-gray-900">{repo.name}</h4>
                              {repo.private && (
                                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                                  Private
                                </span>
                              )}
                              {repo.language && (
                                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                  {repo.language}
                                </span>
                              )}
                            </div>
                            {repo.description && (
                              <p className="text-sm text-gray-600 mt-1">{repo.description}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              Updated {new Date(repo.updated_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setStep('auth')}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}

            {step === 'analysis' && selectedRepo && analysis && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-md">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Analysis Complete: {selectedRepo.name}
                    </p>
                    <p className="text-sm text-blue-700">
                      Ready for deployment configuration
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Project Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium">{analysis.projectType}</span>
                      </div>
                      {analysis.framework && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Framework:</span>
                          <span className="font-medium">{analysis.framework}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Docker:</span>
                        <span className={`font-medium ${analysis.hasDockerfile ? 'text-green-600' : 'text-gray-500'}`}>
                          {analysis.hasDockerfile ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Database:</span>
                        <span className={`font-medium ${analysis.hasDatabase ? 'text-green-600' : 'text-gray-500'}`}>
                          {analysis.hasDatabase ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Technologies</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.technologies.map((tech: string, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {analysis.deploymentRecommendations && analysis.deploymentRecommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Deployment Recommendations</h4>
                    <div className="space-y-2">
                      {analysis.deploymentRecommendations.map((rec: any, index: number) => (
                        <div key={index} className="p-3 border border-gray-200 rounded-md">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-medium text-gray-900">{rec.platform}</h5>
                              <p className="text-sm text-gray-600">{rec.reason}</p>
                            </div>
                            <span className="text-sm font-medium text-green-600">{rec.cost}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setStep('repos')}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSelectRepository}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    Select Repository
                  </button>
                </div>
              </div>
            )}

            {isLoading && step === 'repos' && (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Analyzing repository...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
