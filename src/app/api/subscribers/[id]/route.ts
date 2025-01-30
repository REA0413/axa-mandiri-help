import { NextResponse } from 'next/server';
import { db } from '@/db/config';
import { subscribers } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { email } = await request.json();
    await db.update(subscribers)
      .set({ email })
      .where(eq(subscribers.id, parseInt(params.id)));
    
    return NextResponse.json({ message: 'Updated successfully' });
  } catch (err) {
    console.error('Update error:', err);
    return NextResponse.json({ error: 'Failed to update subscriber' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.delete(subscribers)
      .where(eq(subscribers.id, parseInt(params.id)));
    
    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    return NextResponse.json({ error: 'Failed to delete subscriber' }, { status: 500 });
  }
} 