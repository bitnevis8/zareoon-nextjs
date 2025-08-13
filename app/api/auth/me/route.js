import { API_ENDPOINTS } from "@/app/config/api";

export async function GET(request) {
  try {
    // Forward cookies to the backend (important for JWT token)
    const cookies = request.headers.get('cookie');
    console.log("Cookies received in /api/auth/me proxy:", cookies);

    const backendResponse = await fetch(API_ENDPOINTS.auth.me, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies || '', // Forward cookies
      },
    });

    // Check if response is ok
    if (!backendResponse.ok) {
      console.error("Backend response not ok:", backendResponse.status, backendResponse.statusText);
      
      // Try to get error text first
      let errorText;
      try {
        errorText = await backendResponse.text();
      } catch (e) {
        errorText = "Unknown error";
      }
      
      console.error("Backend error response:", errorText);
      
      return new Response(JSON.stringify({ 
        success: false, 
        message: `Backend error: ${backendResponse.status} ${backendResponse.statusText}`,
        error: errorText
      }), {
        status: backendResponse.status,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Get the Set-Cookie header from backend response
    const setCookieHeader = backendResponse.headers.get('Set-Cookie');

    // Check content type
    const contentType = backendResponse.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error("Backend returned non-JSON content:", contentType);
      const text = await backendResponse.text();
      console.error("Response text:", text.substring(0, 200)); // Log first 200 chars
      
      return new Response(JSON.stringify({ 
        success: false, 
        message: "Backend returned non-JSON response",
        contentType: contentType
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const data = await backendResponse.json();
    
    const response = new Response(JSON.stringify(data), {
      status: backendResponse.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // If backend sets a cookie, propagate it to the frontend
    if (setCookieHeader) {
      response.headers.append('Set-Cookie', setCookieHeader);
    }

    return response;
  } catch (error) {
    console.error("Error proxying /me request:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: "Internal Server Error",
      error: error.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
} 