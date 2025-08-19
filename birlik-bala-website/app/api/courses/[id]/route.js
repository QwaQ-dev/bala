
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

export async function GET(request, { params }) {
  console.log("[Course API] GET called for course ID:", params.id, "at", new Date().toISOString());
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    console.log("[Course API] Cookies:", cookieHeader || "none");
    const token = request.cookies.get("access_token")?.value;
    const headers = {
      "Cookie": cookieHeader,
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout
    const response = await fetch(`${BACKEND_URL}/api/v1/auth/course/get/${params.id}`, {
      method: "GET",
      headers,
      credentials: "include",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    console.log("[Course API] Backend response status:", response.status);
    console.log("[Course API] Backend response headers:", [...response.headers.entries()]);
    const contentType = response.headers.get("content-type");
    const responseText = await response.json();
    console.log("[Course API] Backend response body:", responseText);

    let data = {};
    if (response.status >= 200 && response.status < 300) {
      if (contentType?.includes("application/json")) {
        try {
          data = responseText.course
        } catch (parseError) {
          console.error("[Course API] Ошибка парсинга JSON:", parseError.message, responseText);
          data = { message: responseText || "Курс получен", id: params.id, videos: [] };
        }
      } else {
        console.log("[Course API] Non-JSON success response:", responseText);
        data = { message: responseText || "Курс получен", id: params.id, videos: [] };
      }
    } else {
      if (contentType?.includes("application/json")) {
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error("[Course API] Ошибка парсинга JSON для ответа об ошибке:", parseError.message, responseText);
          return new Response(
            JSON.stringify({
              error: "Ошибка сервера",
              status: response.status,
              details: responseText.slice(0, 100) + "...",
            }),
            {
              status: response.status,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      } else {
        console.error("[Course API] Non-JSON error response:", responseText);
        return new Response(
          JSON.stringify({
            error: "Ошибка сервера",
            status: response.status,
            details: responseText.slice(0, 100) + "...",
          }),
          {
            status: response.status,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      console.error("[Course API] Backend error details:", data);
      return new Response(
        JSON.stringify({
          error: "Не удалось получить курс",
          status: response.status,
          details: data.error || responseText,
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify(data),
      {
        status: response.status, // Pass through backend status (200 or 201)
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("[Course API] Ошибка запроса:", { name: err.name, message: err.message });
    if (err.name === "AbortError") {
      return new Response(
        JSON.stringify({
          error: `Таймаут подключения к ${BACKEND_URL}`,
        }),
        {
          status: 504,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    if (err.code === "ECONNREFUSED") {
      return new Response(
        JSON.stringify({
          error: `Не удалось подключиться к ${BACKEND_URL}`,
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    return new Response(
      JSON.stringify({ error: err.message || "Не удалось получить курс" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
