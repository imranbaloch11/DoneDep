'use client';

import React, { useState } from 'react';
import { GitBranch, Globe, Database, Shield, Zap, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import { deployMindAPI, DeploymentRepository, DeploymentRequirements, ProjectAnalysis } from '../../services/api/deploymind';
import { toast } from 'react-hot-toast';

interface ProjectAnalyzerProps {
  onAnalysisComplete?: (analysis: ProjectAnalysis) => void;
}

export default function ProjectAnalyzer({ onAnalysisComplete }: ProjectAnalyzerProps) {
  const [repository, setRepository] = useState<DeploymentRepository>({
    url: '',
    branch: 'main',
    framework: '',
    language: '',
    packageManager: 'npm'
  });

  const [requirements, setRequirements] = useState<DeploymentRequirements>({
    domain: '',
    ssl: true,
    monitoring: false,
    scaling: 'manual',
    database: '',
    caching: '',
    cdn: false
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ProjectAnalysis | null>(null);

  const frameworks = [
    'nextjs', 'react', 'vue', 'angular', 'svelte', 'nuxt',
    'express', 'fastify', 'nestjs', 'django', 'flask', 'laravel',
    'spring-boot', 'asp.net', 'ruby-on-rails', 'other'
  ];

  const languages = [
    'javascript', 'typescript', 'python', 'java', 'c#', 'php',
    'ruby', 'go', 'rust', 'kotlin', 'swift', 'other'
  ];

  const databases = [
    'postgresql', 'mysql', 'mongodb', 'redis', 'sqlite',
    'dynamodb', 'firebase', 'supabase', 'none'
  ];

  const handleAnalyze = async () => {
    if (!repository.url || !repository.framework || !repository.language) {
      toast.error('Please fill in repository URL, framework, and language');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await deployMindAPI.analyzeProject(repository, requirements);
      setAnalysis(result);
      onAnalysisComplete?.(result);
      toast.success('Project analysis completed!');
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('Failed to analyze project');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Analysis</h2>
        <p className="text-gray-600">Analyze your project to get intelligent deployment recommendations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Repository Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <GitBranch size={20} />
            Repository Information
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Repository URL *
            </label>
            <input
              type="url"
              value={repository.url}
              onChange={(e) => setRepository(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://github.com/username/project"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch
              </label>
              <input
                type="text"
                value={repository.branch}
                onChange={(e) => setRepository(prev => ({ ...prev, branch: e.target.value }))}
                placeholder="main"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Package Manager
              </label>
              <select
                value={repository.packageManager}
                onChange={(e) => setRepository(prev => ({ ...prev, packageManager: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="npm">npm</option>
                <option value="yarn">yarn</option>
                <option value="pnpm">pnpm</option>
                <option value="pip">pip</option>
                <option value="composer">composer</option>
                <option value="maven">maven</option>
                <option value="gradle">gradle</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Framework *
              </label>
              <select
                value={repository.framework}
                onChange={(e) => setRepository(prev => ({ ...prev, framework: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select framework</option>
                {frameworks.map(fw => (
                  <option key={fw} value={fw}>{fw}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language *
              </label>
              <select
                value={repository.language}
                onChange={(e) => setRepository(prev => ({ ...prev, language: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select language</option>
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Deployment Requirements */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Globe size={20} />
            Deployment Requirements
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custom Domain
            </label>
            <input
              type="text"
              value={requirements.domain}
              onChange={(e) => setRequirements(prev => ({ ...prev, domain: e.target.value }))}
              placeholder="example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Database
            </label>
            <select
              value={requirements.database}
              onChange={(e) => setRequirements(prev => ({ ...prev, database: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">No database</option>
              {databases.map(db => (
                <option key={db} value={db}>{db}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Scaling Strategy
            </label>
            <select
              value={requirements.scaling}
              onChange={(e) => setRequirements(prev => ({ ...prev, scaling: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="manual">Manual Scaling</option>
              <option value="auto">Auto Scaling</option>
              <option value="serverless">Serverless</option>
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="ssl"
                checked={requirements.ssl}
                onChange={(e) => setRequirements(prev => ({ ...prev, ssl: e.target.checked }))}
                className="mr-2"
              />
              <label htmlFor="ssl" className="text-sm text-gray-700 flex items-center gap-1">
                <Shield size={16} />
                SSL Certificate
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="monitoring"
                checked={requirements.monitoring}
                onChange={(e) => setRequirements(prev => ({ ...prev, monitoring: e.target.checked }))}
                className="mr-2"
              />
              <label htmlFor="monitoring" className="text-sm text-gray-700 flex items-center gap-1">
                <Zap size={16} />
                Monitoring & Alerting
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="cdn"
                checked={requirements.cdn}
                onChange={(e) => setRequirements(prev => ({ ...prev, cdn: e.target.checked }))}
                className="mr-2"
              />
              <label htmlFor="cdn" className="text-sm text-gray-700">
                CDN (Content Delivery Network)
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !repository.url || !repository.framework || !repository.language}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
        >
          {isAnalyzing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Analyzing Project...
            </>
          ) : (
            <>
              <Zap size={16} />
              Analyze Project
            </>
          )}
        </button>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap size={20} className="text-green-600" />
            Analysis Complete
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {analysis.recommendations.complexity && (
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={16} className="text-orange-500" />
                  <span className="font-medium">Complexity</span>
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {analysis.recommendations.complexity}/10
                </div>
              </div>
            )}

            {analysis.recommendations.estimatedCost && (
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign size={16} className="text-green-500" />
                  <span className="font-medium">Est. Cost</span>
                </div>
                <div className="text-lg font-bold text-green-600">
                  {analysis.recommendations.estimatedCost}
                </div>
              </div>
            )}

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-blue-500" />
                <span className="font-medium">Context ID</span>
              </div>
              <div className="text-xs font-mono text-blue-600 break-all">
                {analysis.contextId}
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-medium mb-2">Recommendations</h4>
            <div className="text-sm text-gray-700 whitespace-pre-wrap">
              {analysis.analysis}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
