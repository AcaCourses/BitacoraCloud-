import { NextResponse } from 'next/server';
import { verifyReport } from '@/lib/server/sign';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { payload, sig } = body;

    if (!payload || !sig) {
      return NextResponse.json({ error: 'Faltan payload o firma (sig)' }, { status: 400 });
    }

    const isValid = verifyReport(JSON.stringify(payload), sig);
    
    return NextResponse.json({ valid: isValid });
  } catch (error) {
    return NextResponse.json({ error: 'Error validando firma' }, { status: 500 });
  }
}
