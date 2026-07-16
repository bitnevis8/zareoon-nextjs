import { NextResponse } from "next/server";
import { apiError } from "@/app/utils/apiErrors";

export async function GET() {
  try {
    return NextResponse.json({ tags: [], success: true });
  } catch {
    return NextResponse.json({ error: apiError("fetchTags"), success: false }, { status: 500 });
  }
}
