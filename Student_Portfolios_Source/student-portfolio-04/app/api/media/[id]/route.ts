import fs from 'node:fs';
import path from 'node:path';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      const match = files.find(f => f.includes(id));
      if (match) {
        const filePath = path.join(uploadsDir, match);
        const data = fs.readFileSync(filePath);
        const ext = path.extname(match).toLowerCase();
        const contentType =
          ext === '.pdf'
            ? 'application/pdf'
            : ext === '.png'
            ? 'image/png'
            : ext === '.webp'
            ? 'image/webp'
            : 'image/jpeg';

        return new Response(data, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000, immutable'
          }
        });
      }
    }

    return new Response('Media not found', { status: 404 });
  } catch (error) {
    console.error('Media fetch error:', error);
    return new Response('Media temporarily unavailable', { status: 503 });
  }
}
