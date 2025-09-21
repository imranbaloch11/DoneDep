'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { EmailServicesInterface } from '@/components/dashboard/EmailServicesInterface';

export default function EmailServicesPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <EmailServicesInterface />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
