import { NextResponse } from 'next/server';
import { adminAuth, db } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

function getLast7Dates(): string[] {
  const dates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized — missing Bearer token' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];
    await adminAuth.verifyIdToken(token);

    const dates = getLast7Dates();
    const refs = dates.map((d) => db.collection('app_analytics').doc(d));
    const snaps = await Promise.all(refs.map((r) => r.get()));
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const trend = snaps.map((snap, i) => {
      const data = snap.exists ? snap.data()! : {};
      return {
        date: dates[i],
        day: dayNames[new Date(dates[i] + 'T00:00:00').getDay()],
        meals_logged: (data.meals_logged as number) ?? 0,
        vision_uses: (data.vision_uses as number) ?? 0,
        barcode_scans: (data.barcode_scans as number) ?? 0,
        unique_devices: (data.unique_devices as number) ?? 0,
      };
    });

    return NextResponse.json({ today: trend[trend.length - 1], trend });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('auth') || message.includes('token') || message.includes('ID token')) {
      return NextResponse.json({ error: 'Unauthorized — invalid token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error', detail: message }, { status: 500 });
  }
}
