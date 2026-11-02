import { readProfile } from '../../lib/storage';
import { isAuthenticatedAdmin } from '../../lib/auth';
import AdminWrapper from './admin-wrapper';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const isAuth = await isAuthenticatedAdmin();
  const { profile, revision, updatedAt } = await readProfile();

  return (
    <AdminWrapper
      initialAuth={isAuth}
      initialProfile={profile}
      initialRevision={revision}
      lastUpdated={updatedAt}
    />
  );
}
