import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/config';
import { subscribers } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface RouteParams {
  id: string;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: RouteParams }
) {
  const id = params.id;
  try {
    const { email } = await request.json();
    await db.update(subscribers)
      .set({ email })
      .where(eq(subscribers.id, parseInt(id)));
    
    return NextResponse.json({ message: 'Updated successfully' });
  } catch {
    return NextResponse.json({ error: 'Failed to update subscriber' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: RouteParams }
) {
  const id = params.id;
  try {
    await db.delete(subscribers)
      .where(eq(subscribers.id, parseInt(id)));
    
    return NextResponse.json({ message: 'Deleted successfully' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete subscriber' }, { status: 500 });
  }
} 