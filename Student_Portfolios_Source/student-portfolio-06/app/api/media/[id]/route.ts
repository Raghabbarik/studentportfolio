export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!/^[a-f0-9-]{36}$/.test(id)) return new Response('Not found', { status: 404 });

    const cfModule = 'cloudflare' + ':workers';
    const cf = (await import(/* webpackIgnore: true */ cfModule).catch(() => null)) as any;
    const bucket = cf?.env?.BUCKET;

    if (!bucket) {
      return new Response('Media storage unavailable on this environment', { status: 404 });
    }

    const object = await bucket.get(id);
    if (!object) return new Response('Not found', { status: 404 });

    return new Response(object.body, {
      headers: {
        'Content-Type': object.httpMetadata?.contentType ?? 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
        'Content-Disposition':
          object.httpMetadata?.contentType === 'application/pdf' ? 'inline; filename="resume.pdf"' : 'inline',
      },
    });
  } catch (error) {
    console.error(error);
    return new Response('Media temporarily unavailable', { status: 503 });
  }
}
