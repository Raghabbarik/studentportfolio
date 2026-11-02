import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import './portfolio-base.css';
import './creative-portfolio.css';

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'Selected work, skills, and the story behind them.',
  icons: {
    icon: 'data:,'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:," />
      </head>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
