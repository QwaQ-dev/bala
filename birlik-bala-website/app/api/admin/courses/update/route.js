
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

export async function PUT(request) {
  console.log("[Admin Course Update API] Called at", new Date().toISOString());
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    console.log("[Admin Course Update API] Cookies:", cookieHeader || "none");
    const token = request.cookies.get("access_token")?.value;
    const headers = {
      "Cookie": cookieHeader,
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const formData = await request.formData();
    console.log("[Admin Course Update API] FormData entries:", [...formData.entries()]);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout
    const response = await fetch(`${BACKEND_URL}/api/v1/admin/course/update`, {
      method: "PUT",
      headers,
      credentials: "include",
      signal: controller.signal,
      body: formData,
    });
    clearTimeout(timeoutId);

    console.log("[Admin Course Update API] Backend response status:", response.status);
    const responseText = await response.text();
    console.log("[Admin Course Update API] Backend response body:", responseText);

    let data;
    if (response.headers.get("content-type")?.includes("application/json")) {
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("[Admin Course Update API] Ошибка парсинга JSON:", parseError.message, responseText);
        return new Response(
          JSON.stringify({
            error: "Неверный формат ответа от бэкенда",
            details: responseText.slice(0, 100) + "...",
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    } else {
      console.error("[Admin Course Update API] Non-JSON response:", responseText);
      return new Response(
        JSON.stringify({
          error: "Неверный формат ответа от бэкенда",
          details: responseText.slice(0, 100) + "...",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!response.ok) {
      console.error("[Admin Course Update API] Backend error details:", data);
      return new Response(
        JSON.stringify({
          error: "Не удалось обновить курс",
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
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("[Admin Course Update API] Ошибка запроса:", { name: err.name, message: err.message });
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
      JSON.stringify({ error: err.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
