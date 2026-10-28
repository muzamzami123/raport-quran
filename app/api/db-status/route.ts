import { NextResponse } from 'next/server';
import { getDatabaseStatus } from '@/lib/mongodb';

export async function GET() {
  const status = await getDatabaseStatus();
  return NextResponse.json({
    success: status.connected,
    ...status,
    timestamp: new Date().toISOString(),
  });
}
