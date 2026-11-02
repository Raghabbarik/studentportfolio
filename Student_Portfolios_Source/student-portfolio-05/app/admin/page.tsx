import { cookies } from 'next/headers';
import { verifyAdminToken } from '../../lib/auth';
import { readProfile, studentEmail } from '../../lib/storage';
import Editor from '../edit/editor';
import AdminLoginForm from './admin-login';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  const admin = await verifyAdminToken(token);

  if (!admin) {
    return <AdminLoginForm />;
  }

  try {
    const data = await readProfile();
    return (
      <Editor
        initial={data.profile}
        initialRevision={data.revision}
        owner={true}
        userEmail={admin.email}
        assignedEmail={await studentEmail()}
      />
    );
  } catch (error) {
    console.error('Error loading profile for admin:', error);
    return (
      <main className="unavailable">
        <h1>Admin Portal Unavailable</h1>
        <p>Could not load the portfolio database. Please retry.</p>
        <a className="button" href="/admin">
          Retry
        </a>
      </main>
    );
  }
}

