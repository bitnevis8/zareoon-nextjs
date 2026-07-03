import { API_ENDPOINTS } from "@/app/config/api";

export async function PUT(request) {
  try {
    const cookies = request.headers.get("cookie");
    const body = await request.json();

    const backendResponse = await fetch(API_ENDPOINTS.auth.updateProfile, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookies || "",
      },
      body: JSON.stringify(body),
    });

    const data = await backendResponse.json();

    return new Response(JSON.stringify(data), {
      status: backendResponse.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
