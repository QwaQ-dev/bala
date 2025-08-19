const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

export async function POST(request) {
  console.log("[Admin Checklist Create API] Called at", new Date().toISOString());
  try {
    const body = await request.json();
    console.log("[Admin Checklist Create API] Request body:", body);

    const cookieHeader = request.headers.get("cookie") || "";
    console.log("[Admin Checklist Create API] Cookies:", cookieHeader || "none");
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
    const response = await fetch(`${BACKEND_URL}/api/v1/admin/checklist/create`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    console.log("[Admin Checklist Create API] Backend response status:", response.status);
    console.log("[Admin Checklist Create API] Backend response headers:", [...response.headers.entries()]);
    const responseText = await response.text();
    console.log("[Admin Checklist Create API] Backend response body:", responseText);

    let data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      console.error("[Admin Checklist Create API] JSON parse error:", parseError.message, responseText);
      return new Response(
        JSON.stringify({
          error: "Неверный формат ответа от бэкенда",
          details: responseText.slice(0, 100) + "...",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!response.ok) {
      console.error("[Admin Checklist Create API] Backend error details:", data);
      return new Response(
        JSON.stringify({
          error: "Не удалось создать чеклист",
          status: response.status,
          details: data.error || responseText || "Неизвестная ошибка",
        }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!data.id) {
      console.warn("[Admin Checklist Create API] No checklist ID in response:", data);
      data = { ...data, warning: "ID чеклиста не возвращён сервером" };
    }

    return new Response(
      JSON.stringify(data),
      { status: response.status, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[Admin Checklist Create API] Request error:", { name: err.name, message: err.message });
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