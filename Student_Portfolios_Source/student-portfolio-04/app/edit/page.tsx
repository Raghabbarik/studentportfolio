import Link from 'next/link';
import { requireChatGPTUser } from '../chatgpt-auth';
import { permission, readProfile, studentEmail } from '../../lib/storage';
import Editor from './editor';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const user = await requireChatGPTUser('/edit');

  let role: string;
  let data;
  let assignedStudentEmail = '';
  let loadError = false;

  try {
    role = await permission(user.email);
    if (role !== 'none') {
      data = await readProfile();
      if (role === 'owner') {
        assignedStudentEmail = await studentEmail();
      }
    }
  } catch (error) {
    console.error(error);
    loadError = true;
    role = 'none';
  }

  if (loadError) {
    return (
      <main className="unavailable">
        <h1>The editor is temporarily unavailable.</h1>
        <p>Please retry. Your saved portfolio is safe.</p>
        <Link className="button" href="/edit">
          Try again
        </Link>
      </main>
    );
  }

  if (role === 'none') {
    return (
      <main className="unavailable">
        <p className="eyebrow">PRIVATE EDITOR</p>
        <h1>Editing access is needed.</h1>
        <p>
          Ask the portfolio owner to assign your signed-in email address:{' '}
          <strong>{user.email}</strong>.
        </p>
        <Link className="button" href="/">
          View portfolio
        </Link>
        <a href="/api/admin/logout">Sign in as Administrator</a>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="unavailable">
        <h1>The editor is temporarily unavailable.</h1>
        <p>Please retry. Your saved portfolio is safe.</p>
        <Link className="button" href="/admin">
          Go to Admin Portal
        </Link>
      </main>
    );
  }

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
