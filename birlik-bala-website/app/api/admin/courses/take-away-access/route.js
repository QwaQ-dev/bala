const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

export async function POST(request) {
  console.log("[Admin Take Away Access API] Called at", new Date().toISOString());
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    console.log("[Admin Take Away Access API] Cookies:", cookieHeader || "none");

    const token = request.cookies.get("access_token")?.value;

    const headers = {
      "Content-Type": "application/json",
      "Cookie": cookieHeader,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const body = await request.json();
    console.log("[Admin Take Away Access API] Request body:", body);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${BACKEND_URL}/api/v1/admin/course/take-away-access`, {
      method: "POST",
      headers,
      credentials: "include",
      signal: controller.signal,
      body: JSON.stringify(body),
    });

    clearTimeout(timeoutId);
    console.log("[Admin Take Away Access API] Backend response status:", response.status);
    const responseText = await response.text();
    console.log("[Admin Take Away Access API] Backend response body:", responseText);

    if (!response.ok) {
      console.error("[Admin Take Away Access API] Backend error details:", responseText);
      return new Response(
        JSON.stringify({
          error: "Не удалось отозвать доступ",
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
      console.error("[Admin Take Away Access API] Ошибка парсинга JSON:", parseError.message);
      return new Response(
        JSON.stringify({
          error: "Неверный формат ответа от бэкенда",
          details: responseText,
        }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    console.error("[Admin Take Away Access API] Ошибка запроса:", { name: err.name, message: err.message });
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
