import { NextResponse } from "next/server";
import { getServerApiBaseUrl, fetchWithTimeout } from "@/app/config/serverApiBase";

export async function GET(_request, { params }) {
  try {
    const { id: productId } = await params;

    if (!productId) {
      return NextResponse.json({ success: false, message: "Product ID is required" }, { status: 400 });
    }

    const response = await fetchWithTimeout(
      `${getServerApiBaseUrl()}/supplier/product/${encodeURIComponent(productId)}/hierarchical-stock`,
      { headers: { "Content-Type": "application/json" } },
      12000
    );

    if (!response.ok) {
      let message = "Failed to fetch hierarchical stock";
      try {
        const errorData = await response.json();
        message = errorData.message || message;
      } catch {
        /* ignore */
      }
      return NextResponse.json({ success: false, message }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in hierarchical stock API:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
