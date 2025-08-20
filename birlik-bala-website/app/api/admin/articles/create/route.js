
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

export async function POST(request) {
  console.log("[Admin Article Create API] Called at", new Date().toISOString());
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    console.log("[Admin Article Create API] Cookies:", cookieHeader || "none");
    const token = request.cookies.get("access_token")?.value;
    const headers = {
      "Cookie": cookieHeader,
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const formData = await request.formData();
    console.log("[Admin Article Create API] FormData entries:", [...formData.entries()]);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout
    const response = await fetch(`${BACKEND_URL}/api/v1/admin/article/create`, {
      method: "POST",
      headers,
      credentials: "include",
      signal: controller.signal,
      body: formData,
    });
    clearTimeout(timeoutId);

    console.log("[Admin Article Create API] Backend response status:", response.status);
    console.log("[Admin Article Create API] Backend response headers:", [...response.headers.entries()]);
    const contentType = response.headers.get("content-type");
    const responseText = await response.json();
    
    console.log("[Admin Article Create API] Backend response body:", responseText);

    let data = {};
    // Handle success (2xx status) regardless of content-type
    if (response.status >= 200 && response.status < 300) {
      if (contentType?.includes("application/json")) {
        try {
          data = responseText
        } catch (parseError) {
          console.error("[Admin Article Create API] Ошибка парсинга JSON:", parseError.message, responseText);
          data = { message: responseText || "Статья создана" };
        }
      } else {
        // Treat plain text response as success
        console.log("[Admin Article Create API] Non-JSON success response:", responseText);
        data = { message: responseText || "Статья создана" };
      }
    } else {
      // Handle error response
      if (contentType?.includes("application/json")) {
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error("[Admin Article Create API] Ошибка парсинга JSON для ответа об ошибке:", parseError.message, responseText);
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
        console.error("[Admin Article Create API] Non-JSON error response:", responseText);
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
      console.error("[Admin Article Create API] Backend error details:", data);
      return new Response(
        JSON.stringify({
          error: "Не удалось создать статью",
          status: response.status,
          details: data.error || responseText,
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!data.id) {
      console.warn("[Admin Article Create API] Missing article ID in response:", data);
      data.warning = "ID статьи не возвращён сервером";
    }

    return new Response(
      JSON.stringify(data),
      {
        status: response.status, // Pass through backend status (200 or 201)
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("[Admin Article Create API] Ошибка запроса:", { name: err.name, message: err.message });
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
      JSON.stringify({ error: err.message || "Не удалось создать статью" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
