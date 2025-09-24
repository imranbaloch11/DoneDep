'use client';

import React from 'react';
import DeploymentArchitectureDashboard from '../../components/deployagent/DeploymentArchitectureDashboard';

export default function TestDashboardPage() {
  const testRepository = {
    name: 'test-repo',
    clone_url: 'https://github.com/test/test-repo.git',
    full_name: 'test/test-repo'
  };

  const testProjectId = 'test-project-123';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Test Deployment Dashboard</h1>
          <p className="text-gray-600 mt-2">
            This page shows all the interactive components: Deploy buttons, Test links, Email setup
          </p>
        </div>
        
        <DeploymentArchitectureDashboard
          projectId={testProjectId}
          repositoryUrl={testRepository.clone_url}
          onDeploymentCreated={(deployment) => {
            console.log('Deployment created:', deployment);
          }}
        />
      </div>
    </div>
  );
}
