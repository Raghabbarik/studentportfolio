import { getMedia } from '../../../../lib/storage';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!/^[a-f0-9-]{36}$/.test(id)) return new Response('Not found', { status: 404 });

    const mediaRow = await getMedia(id);
    if (mediaRow) {
      const buffer = Buffer.from(mediaRow.data, 'base64');
      const isPdf = mediaRow.contentType === 'application/pdf';
      return new Response(buffer, {
        headers: {
          'Content-Type': mediaRow.contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Content-Type-Options': 'nosniff',
          'Content-Disposition': isPdf ? 'inline; filename="resume.pdf"' : 'inline',
        },
      });
    }

    return new Response('Not found', { status: 404 });
  } catch (error) {
    console.error('Media retrieval error:', error);
    return new Response('Media temporarily unavailable', { status: 503 });
  }
}
