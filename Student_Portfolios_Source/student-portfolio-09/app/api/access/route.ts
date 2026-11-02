import {getChatGPTUser} from '../../chatgpt-auth';
import {permission,saveStudentEmail,sameOrigin,isRequestAdmin} from '../../../lib/storage';

export async function PUT(req: Request) {
  try {
    if (!sameOrigin(req)) {
      return Response.json({error: 'Invalid request origin.'}, {status: 403});
    }

    const u = await getChatGPTUser();
    const isAdm = isRequestAdmin(req);

    if (!isAdm && (!u || (await permission(u.email)) !== 'owner')) {
      return Response.json({error: 'Only the portfolio owner or admin can assign editing access.'}, {status: 403});
    }

    const {email} = await req.json() as {email: unknown};
    if (typeof email !== 'string' || email.length > 160 || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
      return Response.json({error: 'Enter a valid student email, or leave it blank to remove access.'}, {status: 400});
    }

    await saveStudentEmail(email);
    return Response.json({success: true});
  } catch (error) {
    console.error('PUT /api/access error:', error);
    return Response.json({error: 'Unable to save access. Please try again.'}, {status: 503});
  }
}

