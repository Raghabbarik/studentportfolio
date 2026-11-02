import { sameOrigin, saveMedia } from '../../../lib/storage';
import { isAuthenticatedAdmin } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    if (!sameOrigin(req)) return Response.json({ error: 'Invalid request origin.' }, { status: 403 });

    // Verify admin authentication
    const isAdmin = await isAuthenticatedAdmin(req);
    if (!isAdmin) {
      return Response.json({ error: 'Admin authentication required to upload files.' }, { status: 401 });
    }

    if (Number(req.headers.get('content-length') ?? 0) > 10 * 1024 * 1024)
      return Response.json({ error: 'Choose a file smaller than 10 MB.' }, { status: 413 });

    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File) || file.size > 10 * 1024 * 1024)
      return Response.json({ error: 'Choose a file smaller than 10 MB.' }, { status: 400 });

    const buffer = await file.arrayBuffer();
    const data = new Uint8Array(buffer);
    let type = file.type || '';

    // Sniff type if not set
    if (data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) type = 'image/jpeg';
    else if (data.slice(0, 8).join(',') === '137,80,78,71,13,10,26,10') type = 'image/png';
    else if (new TextDecoder().decode(data.slice(0, 4)) === 'RIFF' && new TextDecoder().decode(data.slice(8, 12)) === 'WEBP')
      type = 'image/webp';
    else if (new TextDecoder().decode(data.slice(0, 5)) === '%PDF-') type = 'application/pdf';
    else if (file.name.endsWith('.svg') || new TextDecoder().decode(data.slice(0, 100)).includes('<svg'))
      type = 'image/svg+xml';

    if (!type) type = file.type || 'application/octet-stream';

    const id = crypto.randomUUID();
    const base64Data = Buffer.from(buffer).toString('base64');

    // Save to local JSON media store
    await saveMedia(id, base64Data, type);

    return Response.json({ url: '/api/media/' + id });
  } catch (error) {
    console.error('Upload failed error:', error);
    return Response.json({ error: 'Upload failed. Please try again.' }, { status: 500 });
  }
}
