'use client';

import { useState } from 'react';
import type { Profile } from '../../lib/portfolio';
import AdminLogin from './admin-login';
import AdminPanel from './admin-panel';

interface AdminWrapperProps {
  initialAuth: boolean;
  initialProfile: Profile;
  initialRevision: number;
  lastUpdated: string | null;
}

export default function AdminWrapper({
  initialAuth,
  initialProfile,
  initialRevision,
  lastUpdated,
}: AdminWrapperProps) {
  const [authenticated, setAuthenticated] = useState<boolean>(initialAuth);

  async function handleLogout() {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    }
    setAuthenticated(false);
  }

  if (!authenticated) {
    return <AdminLogin onSuccess={() => setAuthenticated(true)} />;
  }

  return (
    <AdminPanel
      initialProfile={initialProfile}
      initialRevision={initialRevision}
      lastUpdated={lastUpdated}
      onLogout={handleLogout}
    />
  );
}

