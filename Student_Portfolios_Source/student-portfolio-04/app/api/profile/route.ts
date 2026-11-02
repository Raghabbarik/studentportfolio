import { getChatGPTUser } from '../../chatgpt-auth';
import { readProfile, saveProfileData, permission, sameOrigin } from '../../../lib/storage';
import { profileSchema, safeUrl } from '../../../lib/portfolio';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return Response.json(await readProfile(), {
      headers: { 'Cache-Control': 'no-store' }
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: 'Unable to load this portfolio. Please try again.' },
      { status: 503 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    if (!sameOrigin(req)) {
      return Response.json({ error: 'Invalid request origin.' }, { status: 403 });
    }

    const user = await getChatGPTUser();
    if (!user) {
      return Response.json({ error: 'Sign in to edit this portfolio.' }, { status: 401 });
    }

    if ((await permission(user.email)) === 'none') {
      return Response.json({ error: 'You do not have editing access to this portfolio.' }, { status: 403 });
    }

    const body = (await req.json()) as { profile: unknown; revision: number };
    const parsed = profileSchema.safeParse(body.profile);

    if (!parsed.success || !Number.isInteger(body.revision) || body.revision < 0) {
      return Response.json({ error: 'Please check your profile fields.' }, { status: 400 });
    }

    const p = parsed.data;

    for (const url of [
      p.photo,
      p.resume,
      p.github,
      p.linkedin,
      p.instagram,
      ...p.projects.flatMap(x => [x.url, x.image])
    ]) {
      if (url && !safeUrl(url)) {
        return Response.json({ error: 'Use a valid http or https link.' }, { status: 400 });
      }
    }

    if (p.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) {
      return Response.json({ error: 'Please enter a valid contact email.' }, { status: 400 });
    }

    // Save directly to the local JSON file on hard drive!
    const result = await saveProfileData(p, body.revision);
    return Response.json(result);
  } catch (error) {
    console.error('Failed to save profile:', error);
    return Response.json(
      { error: 'Your changes could not be saved. Your draft is still here; please try again.' },
      { status: 503 }
    );
  }
}
