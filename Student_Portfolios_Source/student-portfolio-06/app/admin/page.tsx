import AdminPortal from './admin-portal';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin Portal — Student Portfolio',
  description: 'Manage projects, profile, and portfolio content with instant disk sync.',
};

export default function AdminPage() {
  return <AdminPortal />;
}

