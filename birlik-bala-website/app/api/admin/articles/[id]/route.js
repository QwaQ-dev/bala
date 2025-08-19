const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

export async function DELETE(request, { params }) {
  const { id } = params;
  console.log("[Admin Article Delete API] Called for id:", id, "at", new Date().toISOString());
  try {
    if (!id || isNaN(parseInt(id))) {
      console.error("[Admin Article Delete API] Invalid article ID:", id);
      return new Response(
        JSON.stringify({ error: "Неверный ID статьи" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const cookieHeader = request.headers.get("cookie") || "";
    console.log("[Admin Article Delete API] Cookies:", cookieHeader || "none");
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
    const response = await fetch(`${BACKEND_URL}/api/v1/admin/article/${id}`, {
      method: "DELETE",
      headers,
      credentials: "include",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    console.log("[Admin Article Delete API] Backend response status:", response.status);
    console.log("[Admin Article Delete API] Backend response headers:", [...response.headers.entries()]);
    const responseText = await response.text();
    console.log("[Admin Article Delete API] Backend response body:", responseText);

    let data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      console.error("[Admin Article Delete API] JSON parse error:", parseError.message, responseText);
      return new Response(
        JSON.stringify({
          error: "Неверный формат ответа от бэкенда",
          details: responseText.slice(0, 100) + "...",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!response.ok) {
      console.error("[Admin Article Delete API] Backend error details:", data);
      return new Response(
        JSON.stringify({
          error: "Не удалось удалить статью",
          status: response.status,
          details: data.error || responseText || "Неизвестная ошибка",
        }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ message: "Статья успешно удалена" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[Admin Article Delete API] Request error:", { name: err.name, message: err.message });
    if (err.name === "AbortError") {
      return new Response(
        JSON.stringify({ error: `Таймаут подключения к ${BACKEND_URL}` }),
        { status: 504, headers: { "Content-Type": "application/json" } }
      );
    }
    if (err.code === "ECONNREFUSED") {
      return new Response(
        JSON.stringify({ error: `Не удалось подключиться к ${BACKEND_URL}` }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({ error: err.message || "Внутренняя ошибка сервера" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}