import { getChatGPTUser } from '../chatgpt-auth';
import { permission, readProfile, studentEmail } from '../../lib/storage';
import Editor from '../edit/editor';
import AdminLogin from './admin-login';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin Portal · Raghab Portfolio',
  description: 'Manage and update your portfolio projects, profile, and settings.'
};

export default async function AdminPage() {
  const user = await getChatGPTUser();

  // If not logged in: display Admin Login box
  if (!user) {
    return <AdminLogin />;
  }

  // Verify permission
  let role = 'none';
  let data;
  let assignedStudentEmail = '';

  try {
    role = await permission(user.email);
    if (role !== 'none') {
      data = await readProfile();
      if (role === 'owner') {
        assignedStudentEmail = await studentEmail();
      }
    }
  } catch (err) {
    console.error('Failed to load profile for admin:', err);
    return <AdminLogin initialError="Database storage is temporarily unavailable. Please retry." />;
  }

  if (role === 'none') {
    return <AdminLogin initialError={`Email ${user.email} is not authorized for administration.`} />;
  }

  if (!data) {
    return <AdminLogin initialError="Unable to load portfolio details. Please retry." />;
  }

  // Render the full portfolio editor
  return (
    <Editor
      initial={data.profile}
      initialRevision={data.revision}
      owner={role === 'owner'}
      userEmail={user.email}
      assignedEmail={assignedStudentEmail}
    />
  );
}

