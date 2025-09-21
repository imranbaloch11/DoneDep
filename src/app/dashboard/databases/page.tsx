'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DatabasesInterface } from '@/components/dashboard/DatabasesInterface';

export default function DatabasesPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <DatabasesInterface />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
