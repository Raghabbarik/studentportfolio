import {headers} from 'next/headers';
import {checkAdminAuthCookie, readProfile, studentEmail, getAdminCredentials} from '../../lib/storage';
import Editor from '../edit/editor';
import AdminLogin from './admin-login';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  try {
    const reqHeaders = await headers();
    const cookieHeader = reqHeaders.get('cookie') || '';
    const auth = checkAdminAuthCookie(cookieHeader);

    // If not authenticated, display the login form
    if (!auth.authenticated) {
      const creds = await getAdminCredentials();
      return <AdminLogin defaultEmail={creds.email} />;
    }

    const data = await readProfile();
    const student = await studentEmail();

    return (
      <Editor
        initial={data.profile}
        initialRevision={data.revision}
        owner={true}
        userEmail={auth.email || 'student9techxera@gmail.com'}
        assignedEmail={student}
      />
    );
  } catch (error) {
    console.error('Admin page load error:', error);
    return <AdminLogin defaultEmail="student9techxera@gmail.com" />;
  }
}

