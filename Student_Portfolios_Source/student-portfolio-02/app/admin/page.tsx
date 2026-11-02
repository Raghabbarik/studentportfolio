import { headers } from 'next/headers';
import { readFullJsonData } from '../../lib/json-storage';
import { getAdminSession, ADMIN_CREDENTIALS } from '../../lib/admin-auth';
import AdminPanel from './admin-panel';
import './admin.css';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const data = readFullJsonData();
  let isAuthenticated = false;

  try {
    const headerList = await headers();
    const cookieHeader = headerList.get('cookie') || '';
    const authHeader = headerList.get('authorization') || '';
    const req = new Request('http://localhost', {
      headers: {
        cookie: cookieHeader,
        authorization: authHeader
      }
    });
    const session = await getAdminSession(req);
    if (session && session.role === 'admin') {
      isAuthenticated = true;
    }
  } catch (error) {
    // In development or static render, default to false and let client verify
    isAuthenticated = false;
  }

  return (
    <AdminPanel
      initialData={data}
      initialAuth={isAuthenticated}
      adminEmail={ADMIN_CREDENTIALS.email}
    />
  );
}

