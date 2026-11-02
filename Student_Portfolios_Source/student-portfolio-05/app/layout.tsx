import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import './portfolio-base.css';
import './creative-portfolio.css';

export const metadata: Metadata = {
  title: 'Aarav Sharma · B.Tech in Design Portfolio',
  description: 'Selected work, design systems, interaction craft, and academic portfolio of Aarav Sharma.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
