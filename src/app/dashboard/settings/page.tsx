'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { SettingsInterface } from '@/components/dashboard/SettingsInterface';

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <SettingsInterface />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
