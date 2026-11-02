import {getCloudflareWorkersEnv} from '../../../lib/cloudflare';
import {getChatGPTUser} from '../../chatgpt-auth';
import {permission,sameOrigin,isRequestAdmin,saveMediaToDb} from '../../../lib/storage';

export async function POST(req: Request) {
  try {
    if (!sameOrigin(req)) {
      return Response.json({error: 'Invalid request origin.'}, {status: 403});
    }

    const user = await getChatGPTUser();
    const isAdm = isRequestAdmin(req);

    if (!user && !isAdm) {
      return Response.json({error: 'Sign in or enter admin access to upload files.'}, {status: 401});
    }

    if (user && !isAdm && (await permission(user.email)) === 'none') {
      return Response.json({error: 'Editing access is required.'}, {status: 403});
    }

    if (Number(req.headers.get('content-length') ?? 0) > 10 * 1024 * 1024) {
      return Response.json({error: 'Choose a file smaller than 10 MB.'}, {status: 413});
    }

    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File) || file.size > 10 * 1024 * 1024) {
      return Response.json({error: 'Choose a file smaller than 10 MB.'}, {status: 400});
    }

    const arrayBuffer = await file.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);

    // Identify file type
    let type = file.type || '';
    if (data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) type = 'image/jpeg';
    else if (data.slice(0, 8).join(',') === '137,80,78,71,13,10,26,10') type = 'image/png';
    else if (new TextDecoder().decode(data.slice(0, 4)) === 'RIFF' && new TextDecoder().decode(data.slice(8, 12)) === 'WEBP') type = 'image/webp';
    else if (new TextDecoder().decode(data.slice(0, 5)) === '%PDF-') type = 'application/pdf';
    else if (file.type.startsWith('image/')) type = file.type;

    if (!type) {
      return Response.json({error: 'Choose a JPG, PNG, WebP, SVG, or PDF file.'}, {status: 400});
    }

    const id = crypto.randomUUID();

    // Convert to base64
    let binary = '';
    const bytes = new Uint8Array(arrayBuffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    const dataUrl = `data:${type};base64,${base64}`;

    // Store in SQLite media table
    await saveMediaToDb(id, dataUrl, type);

    // Also store in Cloudflare R2 if available
    try {
      const cfEnv = await getCloudflareWorkersEnv();
      if (cfEnv && cfEnv.BUCKET) {
        await cfEnv.BUCKET.put(id, data, {
          httpMetadata: { contentType: type }
        });
      }
    } catch (r2Err) {
      console.warn('R2 storage optional put failed, SQLite preserved media:', r2Err);
    }

    return Response.json({
      url: '/api/media/' + id,
      dataUrl
    });
  } catch (error) {
    console.error('POST /api/upload error:', error);
    return Response.json({error: 'Upload failed. Please try again.'}, {status: 503});
  }
}

