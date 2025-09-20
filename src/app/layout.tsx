import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers/Providers';
import Navigation from '@/components/layout/Navigation';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DoneDep - Autonomous Deployment Platform',
  description: 'One-stop solution for domain management, database provisioning, email services, and seamless deployment integration with Windsurf IDE.',
  keywords: 'deployment, domains, databases, email services, windsurf, automation',
  authors: [{ name: 'DoneDep Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0ea5e9',
  openGraph: {
    title: 'DoneDep - Autonomous Deployment Platform',
    description: 'Streamline your deployment process with our all-in-one platform',
    type: 'website',
    url: 'https://donedep.com',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'DoneDep Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DoneDep - Autonomous Deployment Platform',
    description: 'Streamline your deployment process with our all-in-one platform',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <Navigation />
          {children}
        </Providers>
      </body>
    </html>
  );
}
