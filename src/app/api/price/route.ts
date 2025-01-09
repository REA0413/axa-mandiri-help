import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Read the latest price from the JSON file
    const filePath = path.join(process.cwd(), 'public', 'latest_price.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContent);
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({
      price: 131.9938,
      timestamp: new Date().toISOString(),
      error: 'Failed to read latest price'
    });
  }
} 