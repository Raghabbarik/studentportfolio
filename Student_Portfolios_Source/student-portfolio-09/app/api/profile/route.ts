import {getChatGPTUser} from '../../chatgpt-auth';
import {readProfile,saveProfile,permission,sameOrigin,isRequestAdmin} from '../../../lib/storage';
import {profileSchema} from '../../../lib/portfolio';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return Response.json(await readProfile(), {
      headers: {'Cache-Control': 'no-store'}
    });
  } catch (error) {
    console.error('GET /api/profile error:', error);
    return Response.json({error: 'Unable to load this portfolio. Please try again.'}, {status: 503});
  }
}

export async function PUT(req: Request) {
  try {
    if (!sameOrigin(req)) {
      return Response.json({error: 'Invalid request origin.'}, {status: 403});
    }

    const user = await getChatGPTUser();
    const isAdm = isRequestAdmin(req);

    if (!user && !isAdm) {
      return Response.json({error: 'Sign in or enter admin access to edit this portfolio.'}, {status: 401});
    }

    if (user && !isAdm && (await permission(user.email)) === 'none') {
      return Response.json({error: 'You do not have editing access to this portfolio.'}, {status: 403});
    }

    // Allow payload up to 20MB for images stored directly in database/code
    const contentLength = Number(req.headers.get('content-length') ?? 0);
    if (contentLength > 20 * 1024 * 1024) {
      return Response.json({error: 'Portfolio payload is too large (max 20MB).'}, {status: 413});
    }

    const body = await req.json() as {profile: unknown; revision: number};
    const parsed = profileSchema.safeParse(body.profile);

    if (!parsed.success) {
      const issue = parsed.error.issues[0]?.message || 'Invalid profile structure.';
      return Response.json({error: `Validation error: ${issue}`}, {status: 400});
    }

    const p = parsed.data;

    // Validate email format if provided
    if (p.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) {
      return Response.json({error: 'Please enter a valid contact email.'}, {status: 400});
    }

    const result = await saveProfile(p, body.revision);
    return Response.json(result);
  } catch (error) {
    console.error('PUT /api/profile error:', error);
    return Response.json({error: 'Your changes could not be saved. Please try again.'}, {status: 503});
  }
}

