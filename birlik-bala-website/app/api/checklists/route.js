const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

export async function GET(request) {
  console.log("[Checklists API] GET called at", new Date().toISOString());
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    console.log("[Checklists API] Cookies:", cookieHeader || "none");
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
    const response = await fetch(`${BACKEND_URL}/api/v1/checklist/get`, {
      method: "GET",
      headers,
      credentials: "include",
      signal: controller.signal,
    });
    console.log(response)
    clearTimeout(timeoutId);

    console.log("[Checklists API] Backend response status:", response.status);
    console.log("[Checklists API] Backend response headers:", [...response.headers.entries()]);
    const responseText = await response.json();
    console.log("[Checklists API] Backend response body:", responseText);

    let data;
    try {
      data = responseText.checklists
      if (!Array.isArray(data)) {
        console.warn("[Checklists API] Expected array, got:", data);
        data = [];
      }
    } catch (parseError) {
      console.error("[Checklists API] JSON parse error:", parseError.message, responseText);
      return new Response(
        JSON.stringify({
          error: "Неверный формат ответа от бэкенда",
          details: responseText.slice(0, 100) + "...",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!response.ok) {
      console.error("[Checklists API] Backend error details:", data);
      return new Response(
        JSON.stringify({
          error: "Не удалось получить чеклисты",
          status: response.status,
          details: data.error || responseText || "Неизвестная ошибка",
        }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[Checklists API] Request error:", { name: err.name, message: err.message });
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
      JSON.stringify({ error: err.message || "Не удалось получить чеклисты" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}