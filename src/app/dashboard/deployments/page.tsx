'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DeploymentsInterface } from '@/components/dashboard/DeploymentsInterface';

export default function DeploymentsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <DeploymentsInterface />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
