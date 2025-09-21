'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DomainsInterface } from '@/components/dashboard/DomainsInterface';

export default function DomainsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <DomainsInterface />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
