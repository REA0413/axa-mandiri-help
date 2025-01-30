import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/config';
import { subscribers } from '@/db/schema';
import { eq } from 'drizzle-orm';

type RouteContext = { params: { id: string } }; // ✅ Explicitly defining type

export async function PUT(
  request: NextRequest,
  context: Pick<RouteContext, 'params'>
) {
  try {
    const id = parseInt(context.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return NextResponse.json({ error: 'Invalid subscriber ID' }, { status: 400 });
    }

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
  context: Pick<RouteContext, 'params'>
) {
  try {
    const id = parseInt(context.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return NextResponse.json({ error: 'Invalid subscriber ID' }, { status: 400 });
    }

    await db.delete(subscribers).where(eq(subscribers.id, id));

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete subscriber' }, { status: 500 });
  }
}
