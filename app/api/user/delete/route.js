import { NextResponse } from "next/server";
import { getServerApiBaseUrl, fetchWithTimeout } from "@/app/config/serverApiBase";

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, message: "شناسه کاربر الزامی است" }, { status: 400 });
    }
    const response = await fetchWithTimeout(`${getServerApiBaseUrl()}/user/user/delete/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ success: false, message: "خطا در حذف کاربر" }, { status: 500 });
  }
}
