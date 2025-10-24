import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    return NextResponse.json({ revalidated: true });
  } catch (e: any) {
    return NextResponse.json({ revalidated: false, error: e?.message || 'error' }, { status: 500 });
  }
}
