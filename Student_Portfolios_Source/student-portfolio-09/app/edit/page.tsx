import { headers } from 'next/headers';
import { checkAdminAuthCookie, readProfile, studentEmail } from '../../lib/storage';
import Editor from './editor';
import AdminLogin from '../admin/admin-login';

export const dynamic = 'force-dynamic';

export default async function Page() {
  try {
    const reqHeaders = await headers();
    const cookieHeader = reqHeaders.get('cookie') || '';
    const auth = checkAdminAuthCookie(cookieHeader);

    if (!auth.authenticated) {
      return <AdminLogin />;
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
    console.error('Editor load error:', error);
    return <AdminLogin defaultEmail="student9techxera@gmail.com" />;
  }
}

