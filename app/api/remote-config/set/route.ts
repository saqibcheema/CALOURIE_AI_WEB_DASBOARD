import { NextResponse } from 'next/server';
import { adminAuth, remoteConfig } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

interface UpdateBody {
  updates: Record<string, string>;
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized — missing Bearer token' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    await adminAuth.verifyIdToken(token);

    const body: UpdateBody = await request.json();
    if (!body?.updates || typeof body.updates !== 'object') {
      return NextResponse.json({ error: 'Bad request — expected { updates: { key: value } }' }, { status: 400 });
    }

    // Fetch current template (preserves existing params + ETag for conflict detection)
    const template = await remoteConfig.getTemplate();

    // Merge updates into existing parameters
    for (const [key, value] of Object.entries(body.updates)) {
      template.parameters[key] = {
        ...template.parameters[key],
        defaultValue: { value: String(value) },
      };
    }

    // Publish the updated template
    const updatedTemplate = await remoteConfig.publishTemplate(template);

    return NextResponse.json({
      success: true,
      version: updatedTemplate.version?.versionNumber,
      updatedKeys: Object.keys(body.updates),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('auth') || message.includes('token') || message.includes('ID token')) {
      return NextResponse.json({ error: 'Unauthorized — invalid token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error', detail: message }, { status: 500 });
  }
}
