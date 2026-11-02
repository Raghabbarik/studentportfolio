import { readPortfolioJSON } from '../../../../lib/json-storage';
import { verifyJWT, extractTokenFromRequest } from '../../../../lib/auth-jwt';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const token = extractTokenFromRequest(req);
    const auth = token ? await verifyJWT(token) : null;

    const data = readPortfolioJSON();
    return Response.json({
      success: true,
      profile: data.profile,
      updatedAt: data.updatedAt,
      authenticated: !!auth,
    });
  } catch (error: any) {
    console.error('Failed to get portfolio data:', error);
    return Response.json(
      { error: 'Failed to retrieve portfolio data' },
      { status: 500 }
    );
  }
}

