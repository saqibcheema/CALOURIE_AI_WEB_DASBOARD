import { NextResponse } from 'next/server';
import { adminAuth, db } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

// ─── GET — fetch history ───────────────────────────────────────────────────────

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await adminAuth.verifyIdToken(authHeader.split('Bearer ')[1]);

    const snap = await db
      .collection('config_changes')
      .orderBy('timestamp', 'desc')
      .limit(100)
      .get();

    const entries = snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        date: d.date as string,
        timestamp: (d.timestamp as FirebaseFirestore.Timestamp).toMillis(),
        key: d.key as string,
        oldValue: d.oldValue as string,
        newValue: d.newValue as string,
      };
    });

    return NextResponse.json({ entries });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('token') || message.includes('auth')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error', detail: message }, { status: 500 });
  }
}

// ─── POST — save new entries ───────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await adminAuth.verifyIdToken(authHeader.split('Bearer ')[1]);

    const body = await request.json();
    const entries: { date: string; key: string; oldValue: string; newValue: string }[] =
      body.entries ?? [];

    if (entries.length === 0) {
      return NextResponse.json({ ok: true, written: 0 });
    }

    const batch = db.batch();
    const now = new Date();

    for (const entry of entries) {
      const ref = db.collection('config_changes').doc();
      batch.set(ref, {
        date: entry.date,
        timestamp: now,
        key: entry.key,
        oldValue: entry.oldValue,
        newValue: entry.newValue,
      });
    }

    await batch.commit();
    return NextResponse.json({ ok: true, written: entries.length });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('token') || message.includes('auth')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error', detail: message }, { status: 500 });
  }
}
