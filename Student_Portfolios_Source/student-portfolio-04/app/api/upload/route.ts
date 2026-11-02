import fs from 'node:fs';
import path from 'node:path';
import { getChatGPTUser } from '../../chatgpt-auth';
import { permission, sameOrigin } from '../../../lib/storage';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    if (!sameOrigin(req)) {
      return Response.json({ error: 'Invalid request origin.' }, { status: 403 });
    }

    const user = await getChatGPTUser();
    if (!user || (await permission(user.email)) === 'none') {
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

    const buffer = Buffer.from(await file.arrayBuffer());
    let ext = 'jpg';
    let mime = 'image/jpeg';

    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      ext = 'jpg';
      mime = 'image/jpeg';
    } else if (buffer.slice(0, 8).join(',') === '137,80,78,71,13,10,26,10') {
      ext = 'png';
      mime = 'image/png';
    } else if (file.type === 'image/webp') {
      ext = 'webp';
      mime = 'image/webp';
    } else if (file.type === 'application/pdf') {
      ext = 'pdf';
      mime = 'application/pdf';
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const filename = `${Date.now()}-${crypto.randomUUID()}.${ext}`;

    try {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      fs.writeFileSync(path.join(uploadsDir, filename), buffer);
      return Response.json({ url: `/uploads/${filename}` });
    } catch {
      // In read-only serverless environment fallback: return Base64 Data URL
      const base64 = buffer.toString('base64');
      const dataUrl = `data:${mime};base64,${base64}`;
      return Response.json({ url: dataUrl });
    }
  } catch (error) {
    console.error('Upload error:', error);
    return Response.json({ error: 'Upload failed. Please try again.' }, { status: 500 });
  }
}
