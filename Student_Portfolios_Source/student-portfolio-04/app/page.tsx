import type { Metadata } from 'next';
import Link from 'next/link';
import Portfolio from './portfolio-view';
import { readProfile } from '../lib/storage';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Portfolio',
    description: 'Selected projects, skills, and engineering work.'
  };
}

export default async function Page() {
  let profileData;
  let loadError = false;

  try {
    profileData = await readProfile();
  } catch (error) {
    console.error(error);
    loadError = true;
  }

  if (loadError || !profileData) {
    return (
      <main className="unavailable">
        <h1>We couldn’t load this portfolio.</h1>
        <p>Please try again in a moment.</p>
        <Link className="button" href="/">
          Try again
        </Link>
      </main>
    );
  }

  return <Portfolio profile={profileData.profile} />;
}
