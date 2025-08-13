import { API_ENDPOINTS } from "@/app/config/api";

export async function POST(request) {
  try {
    const backendResponse = await fetch(API_ENDPOINTS.auth.logout, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
      credentials: 'include',
    });

    const data = await backendResponse.json();

    const response = new Response(JSON.stringify(data), {
      status: backendResponse.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const setCookieHeader = backendResponse.headers.get('Set-Cookie');
    if (setCookieHeader) {
      response.headers.append('Set-Cookie', setCookieHeader);
    }

    return response;
  } catch (error) {
    console.error("Error proxying /logout request:", error);
    return new Response(JSON.stringify({ success: false, message: "Internal Server Error" }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
} 