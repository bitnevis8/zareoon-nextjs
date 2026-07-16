import { NextResponse } from "next/server";
import { apiError } from "@/app/utils/apiErrors";

export async function GET() {
  try {
    return NextResponse.json({ classes: [], success: true });
  } catch {
    return NextResponse.json({ error: apiError("fetchClasses"), success: false }, { status: 500 });
  }
}
