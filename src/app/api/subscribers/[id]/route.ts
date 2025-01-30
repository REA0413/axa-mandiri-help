import { NextResponse } from 'next/server';
import { db } from '@/db/config';
import { subscribers } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { email } = await request.json();
    await db.update(subscribers)
      .set({ email })
      .where(eq(subscribers.id, parseInt(context.params.id)));
    
    return NextResponse.json({ message: 'Updated successfully' });
  } catch {
    return NextResponse.json({ error: 'Failed to update subscriber' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    await db.delete(subscribers)
      .where(eq(subscribers.id, parseInt(context.params.id)));
    
    return NextResponse.json({ message: 'Deleted successfully' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete subscriber' }, { status: 500 });
  }
} 