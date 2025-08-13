import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Backend articles module removed. Return empty list for now.
    return NextResponse.json({ classes: [], success: true });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'خطا در دریافت کلاس‌ها', 
        success: false
      },
      { status: 500 }
    );
  }
} 