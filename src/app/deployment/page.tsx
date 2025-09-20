'use client';

import React from 'react';
import VisualDeploymentInterface from '@/components/deployment/VisualDeploymentInterface';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function DeploymentPage() {
  return (
    <ProtectedRoute>
      <VisualDeploymentInterface />
    </ProtectedRoute>
  );
}
