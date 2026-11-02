import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../../chatgpt-auth';
import { permission, sameOrigin } from '../../../lib/storage';
import { verifyAdminToken } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    if (!sameOrigin(req)) {
      return Response.json({ error: 'Invalid request origin.' }, { status: 403 });
    }

    const admin = await verifyAdminToken(req);
    let authorized = false;

    if (admin) {
      authorized = true;
    } else {
      const user = await getChatGPTUser();
      if (user && (await permission(user.email)) !== 'none') {
        authorized = true;
      }
    }

    if (!authorized) {
      return Response.json({ error: 'Editing access is required.' }, { status: 403 });
    }

    if (Number(req.headers.get('content-length') ?? 0) > 6 * 1024 * 1024) {
      return Response.json({ error: 'Choose a file smaller than 5 MB.' }, { status: 413 });
    }

    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File) || file.size > 5 * 1024 * 1024) {
      return Response.json({ error: 'Choose a file smaller than 5 MB.' }, { status: 400 });
    }

    const data = new Uint8Array(await file.arrayBuffer());
    let type = '';
    if (data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) type = 'image/jpeg';
    if (data.slice(0, 8).join(',') === '137,80,78,71,13,10,26,10') type = 'image/png';
    if (new TextDecoder().decode(data.slice(0, 4)) === 'RIFF' && new TextDecoder().decode(data.slice(8, 12)) === 'WEBP')
      type = 'image/webp';
    if (new TextDecoder().decode(data.slice(0, 5)) === '%PDF-') type = 'application/pdf';
    if (!type) {
      return Response.json({ error: 'Choose a JPG, PNG, WebP, or PDF file.' }, { status: 400 });
    }

    if (!env.BUCKET) throw new Error('Upload storage missing');
    const id = crypto.randomUUID();
    await env.BUCKET.put(id, data, { httpMetadata: { contentType: type } });
    return Response.json({ url: '/api/media/' + id });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Upload failed. Please try again.' }, { status: 503 });
  }
}
