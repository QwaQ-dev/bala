const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

export async function DELETE(request) {
  console.log("[v0] Logout API called at", new Date().toISOString());
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    console.log("[v0] Cookies received:", cookieHeader);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    // Отправляем запрос на бэкенд для завершения сессии
    const response = await fetch(`${BACKEND_URL}/api/v1/auth/logout`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieHeader,
      },
      signal: controller.signal,
      credentials: "include",
    });

    clearTimeout(timeoutId);
    console.log("[v0] Backend response status:", response.status);
    const responseText = await response.text();
    console.log("[v0] Backend response body:", responseText);

    if (!response.ok) {
      console.error("[v0] Backend error details:", responseText);
      return new Response(
        JSON.stringify({
          error: "Не удалось выполнить выход",
          status: response.status,
          details: responseText,
        }),
        { status: response.status }
      );
    }

    // Очищаем cookies на стороне сервера (если бэкенд не сделал это)
    const headers = new Headers();
    headers.append("Set-Cookie", "access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly");

    return new Response(
      JSON.stringify({ message: "Выход успешно выполнен" }),
      {
        status: 200,
        headers,
      }
    );
  } catch (err) {
    console.error("[v0] Fetch error:", { name: err.name, message: err.message });
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