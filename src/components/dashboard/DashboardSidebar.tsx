'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  RocketLaunchIcon,
  HomeIcon,
  CloudIcon,
  GlobeAltIcon,
  CircleStackIcon as DatabaseIcon,
  EnvelopeIcon,
  CogIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';

export function DashboardSidebar() {
  const pathname = usePathname();

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: HomeIcon },
    { name: '🚀 Agentic Deploy', href: '/deployment', icon: RocketLaunchIcon },
    { name: '📁 Repositories', href: '/dashboard/repositories', icon: FolderIcon },
    { name: 'Deployments', href: '/dashboard/deployments', icon: CloudIcon },
    { name: 'Domains', href: '/dashboard/domains', icon: GlobeAltIcon },
    { name: 'Databases', href: '/dashboard/databases', icon: DatabaseIcon },
    { name: 'Email Services', href: '/dashboard/email', icon: EnvelopeIcon },
    { name: 'Settings', href: '/dashboard/settings', icon: CogIcon },
  ];

  return (
    <nav className="mt-8 space-y-1">
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
              isActive
                ? 'bg-primary-100 text-primary-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Icon className="mr-3 h-5 w-5" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
