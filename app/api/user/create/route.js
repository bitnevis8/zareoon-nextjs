import { NextResponse } from "next/server";
import { getServerApiBaseUrl, fetchWithTimeout } from "@/app/config/serverApiBase";

export async function POST(request) {
  try {
    const body = await request.json();
    const response = await fetchWithTimeout(`${getServerApiBaseUrl()}/user/user/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ success: false, message: "خطا در ایجاد کاربر" }, { status: 500 });
  }
}
