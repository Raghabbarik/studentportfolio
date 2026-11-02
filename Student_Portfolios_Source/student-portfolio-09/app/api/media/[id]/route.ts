import {getCloudflareWorkersEnv} from '../../../../lib/cloudflare';
import {getMediaFromDb} from '../../../../lib/storage';

export async function GET(req: Request, {params}: {params: Promise<{id: string}>}) {
  try {
    const {id} = await params;
    if (!/^[a-f0-9-]{36}$/.test(id)) {
      return new Response('Not found', {status: 404});
    }

    // 1. Try R2 bucket if configured
    try {
      const cfEnv = await getCloudflareWorkersEnv();
      if (cfEnv && cfEnv.BUCKET) {
        const object = await cfEnv.BUCKET.get(id);
        if (object) {
          return new Response(object.body, {
            headers: {
              'Content-Type': object.httpMetadata?.contentType ?? 'application/octet-stream',
              'Cache-Control': 'public, max-age=31536000, immutable',
              'X-Content-Type-Options': 'nosniff',
              'Content-Disposition': object.httpMetadata?.contentType === 'application/pdf' ? 'inline; filename="resume.pdf"' : 'inline'
            }
          });
        }
      }
    } catch (r2Err) {
      console.warn('R2 read failed, falling back to SQLite:', r2Err);
    }

    // 2. Try SQLite media table
    const mediaRow = await getMediaFromDb(id);
    if (mediaRow && mediaRow.data) {
      let contentType = mediaRow.contentType || 'image/jpeg';
      let base64Content = mediaRow.data;
      if (base64Content.includes(',')) {
        const parts = base64Content.split(',');
        const mimeMatch = parts[0].match(/:(.*?);/);
        if (mimeMatch) contentType = mimeMatch[1];
        base64Content = parts[1];
      }

      const binaryStr = atob(base64Content);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      return new Response(bytes, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Content-Type-Options': 'nosniff',
          'Content-Disposition': contentType === 'application/pdf' ? 'inline; filename="resume.pdf"' : 'inline'
        }
      });
    }

    return new Response('Not found', {status: 404});
  } catch (error) {
    console.error('GET /api/media/[id] error:', error);
    return new Response('Media temporarily unavailable', {status: 503});
  }
}

