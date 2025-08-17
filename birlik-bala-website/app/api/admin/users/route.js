const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

export async function GET(request) {
  console.log("[Admin Users API] Called at", new Date().toISOString());
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    console.log("[Admin Users API] Cookies:", cookieHeader || "none");

    const token = request.cookies.get("access_token")?.value;

    const headers = {
      "Content-Type": "application/json",
      "Cookie": cookieHeader,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${BACKEND_URL}/api/v1/admin/users`, {
      method: "GET",
      headers,
      credentials: "include",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log("[Admin Users API] Backend response status:", response.status);
    const responseText = await response.text();
    console.log("[Admin Users API] Backend response body:", responseText);

    if (!response.ok) {
      console.error("[Admin Users API] Backend error details:", responseText);
      return new Response(
        JSON.stringify({
          error: "Не удалось загрузить пользователей",
          status: response.status,
          details: responseText,
        }),
        { status: response.status }
      );
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("[Admin Users API] Ошибка парсинга JSON:", parseError.message);
      return new Response(
        JSON.stringify({
          error: "Неверный формат ответа от бэкенда",
          details: responseText,
        }),
        { status: 500 }
      );
    }

    console.log("[Admin Users API] Parsed data:", data);
    if (!Array.isArray(data)) {
      return new Response(
        JSON.stringify({
          error: "Неверный формат данных: ожидался массив",
          received: data,
        }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    console.error("[Admin Users API] Ошибка запроса:", { name: err.name, message: err.message });
    if (err.name === "AbortError") {
      return new Response(
        JSON.stringify({
          error: `Таймаут подключения к ${BACKEND_URL}`,
        }),
        { status: 504 }
      );
    }
    if (err.code === "ECONNREFUSED") {
      return new Response(
        JSON.stringify({
          error: `Не удалось подключиться к ${BACKEND_URL}`,
        }),
        { status: 503 }
      );
    }
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
