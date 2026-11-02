import Portfolio from './portfolio-view';
import { readProfile } from '../lib/storage';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export default async function Page() { try { const { profile } = await readProfile(); return <Portfolio profile={profile} />; } catch (error) { console.error(error); return <main className="unavailable"><h1>We couldn’t load this portfolio.</h1><p>Please try again in a moment.</p><a className="button" href="/">Try again</a></main>; } }
