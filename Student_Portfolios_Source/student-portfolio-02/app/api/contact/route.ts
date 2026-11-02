import { appendContactMessage } from '../../../lib/json-storage';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({})) as {
      name?: string;
      email?: string;
      subject?: string;
      message?: string;
    };

    const name = (body.name || '').trim();
    const email = (body.email || '').trim();
    const subject = (body.subject || '').trim();
    const message = (body.message || '').trim();

    if (!name || name.length < 2) {
      return Response.json({ error: 'Please provide your name.' }, { status: 400 });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    if (!message || message.length < 5) {
      return Response.json({ error: 'Please enter a message (at least 5 characters).' }, { status: 400 });
    }

    const result = appendContactMessage({ name, email, subject, message });

    return Response.json({
      success: true,
      message: 'Thank you! Your message has been sent to the student.',
      messageId: result.messageId
    });
  } catch (error) {
    console.error('Contact form submission error:', error);
    return Response.json(
      { error: 'Could not send message. Please try again later.' },
      { status: 500 }
    );
  }
}

