import { NextResponse } from 'next/server';
import { db } from '@/db/config';
import { subscribers } from '@/db/schema';

export async function GET() {
  try {
    const allSubscribers = await db.select().from(subscribers);
    return NextResponse.json(allSubscribers);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
  }
} 