import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/config';
import { subscribers } from '@/db/schema';
import { eq } from 'drizzle-orm';

function validateId(id: string) {
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId) || parsedId <= 0) {
    throw new Error('Invalid subscriber ID');
  }
  return parsedId;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } } // ✅ Fix: Correctly typing params
) {
  try {
    const id = validateId(params.id);
    const body = await request.json();

    if (!body.email || typeof body.email !== 'string') {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    await db.update(subscribers)
      .set({ email: body.email })
      .where(eq(subscribers.id, id));

    return NextResponse.json({ message: 'Updated successfully' });
  } catch (error) {
    console.error('PUT Error:', error);
    return NextResponse.json({ error: 'Failed to update subscriber' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } } // ✅ Fix: Correctly typing params
) {
  try {
    const id = validateId(params.id);

    await db.delete(subscribers).where(eq(subscribers.id, id));

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete subscriber' }, { status: 500 });
  }
}
