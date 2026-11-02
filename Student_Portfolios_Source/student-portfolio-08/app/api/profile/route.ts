import { readProfile, saveProfile, sameOrigin } from '../../../lib/storage';
import { profileSchema, safeUrl } from '../../../lib/portfolio';
import { isAuthenticatedAdmin } from '../../../lib/auth';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await readProfile();
    return Response.json(data, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Unable to load this portfolio. Please try again.' }, { status: 503 });
  }
}

export async function PUT(req: Request) {
  try {
    if (!sameOrigin(req)) return Response.json({ error: 'Invalid request origin.' }, { status: 403 });

    // Verify admin JWT authentication
    const isAdmin = await isAuthenticatedAdmin(req);
    if (!isAdmin) {
      return Response.json({ error: 'Unauthorized: Admin authentication required.' }, { status: 401 });
    }

    if (Number(req.headers.get('content-length') ?? 0) > 500000)
      return Response.json({ error: 'Portfolio data is too large.' }, { status: 413 });

    const body = (await req.json()) as { profile: unknown; revision: number };
    const parsed = profileSchema.safeParse(body.profile);
    if (!parsed.success || !Number.isInteger(body.revision) || body.revision < 0)
      return Response.json(
        { error: 'Please check your profile fields: ' + parsed.error?.issues.map(i => i.message).join(', ') },
        { status: 400 }
      );

    const p = parsed.data;
    for (const url of [p.photo, p.resume, p.github, p.linkedin, p.instagram, ...p.projects.flatMap(x => [x.url, x.image])]) {
      if (url && !safeUrl(url)) return Response.json({ error: 'Use a valid http, https, or media link: ' + url }, { status: 400 });
    }

    if (p.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email))
      return Response.json({ error: 'Please enter a valid contact email.' }, { status: 400 });

    const result = await saveProfile(p, body.revision);
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/admin', 'layout');
    } catch (revalErr) {
      console.warn('Revalidation notice:', revalErr);
    }
    return Response.json(result);
  } catch (error) {
    console.error('Error saving portfolio:', error);
    return Response.json({ error: 'Your changes could not be saved to JSON file. Please try again.' }, { status: 500 });
  }
}
