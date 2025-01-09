import { NextResponse } from 'next/server';
import { db } from '@/db/config';
import { subscribers } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Check if email already exists
    const existing = await db.select().from(subscribers).where(eq(subscribers.email, email));
    
    if (existing.length > 0) {
      return NextResponse.json({ 
        error: 'Email already subscribed' 
      }, { status: 400 });
    }

    // Insert new subscriber
    await db.insert(subscribers).values({ email });

    return NextResponse.json({ 
      message: 'Successfully subscribed' 
    });

  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json({ 
      error: 'Failed to subscribe' 
    }, { status: 500 });
  }
} 