import { NextResponse } from "next/server";
import { getServerApiBaseUrl, fetchWithTimeout } from "@/app/config/serverApiBase";

export async function GET() {
  try {
    const response = await fetchWithTimeout(`${getServerApiBaseUrl()}/user/user/getAll`, {
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت اطلاعات کاربران" },
      { status: 500 }
    );
  }
}
