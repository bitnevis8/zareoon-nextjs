import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Backend articles module removed. Return empty tags for now.
    return NextResponse.json({ tags: [], success: true });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'خطا در دریافت تگ‌ها', 
        success: false
      },
      { status: 500 }
    );
  }
} 