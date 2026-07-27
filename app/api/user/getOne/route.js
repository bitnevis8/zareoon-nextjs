import { NextResponse } from "next/server";
import { getServerApiBaseUrl, fetchWithTimeout } from "@/app/config/serverApiBase";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, message: "شناسه کاربر الزامی است" }, { status: 400 });
    }
    const response = await fetchWithTimeout(`${getServerApiBaseUrl()}/user/user/getOne/${id}`, {
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ success: false, message: "خطا در دریافت اطلاعات کاربر" }, { status: 500 });
  }
}
