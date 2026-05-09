import { NextResponse } from 'next/server';
import { adminAuth, remoteConfig } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized — missing Bearer token' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    await adminAuth.verifyIdToken(token);

    const template = await remoteConfig.getTemplate();
    return NextResponse.json({ parameters: template.parameters });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('auth') || message.includes('token') || message.includes('ID token')) {
      return NextResponse.json({ error: 'Unauthorized — invalid token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error', detail: message }, { status: 500 });
  }
}
