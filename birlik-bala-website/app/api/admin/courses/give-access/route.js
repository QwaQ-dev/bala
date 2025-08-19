const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

export async function POST(request) {
  console.log("[Admin Give Access API] Called at", new Date().toISOString());
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    console.log("[Admin Give Access API] Cookies:", cookieHeader || "none");
    const token = request.cookies.get("access_token")?.value;

    const headers = {
      "Content-Type": "application/json",
      "Cookie": cookieHeader,
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const body = await request.json();
    console.log("[Admin Give Access API] Request body:", body);

    if (!body.user_id || !body.course_id) {
      console.error("[Admin Give Access API] Missing user_id or course_id");
      return new Response(
        JSON.stringify({ error: "Требуются user_id и course_id" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(`${BACKEND_URL}/api/v1/admin/course/give-access`, {
      method: "POST",
      headers,
      credentials: "include",
      signal: controller.signal,
      body: JSON.stringify({ user_id: body.user_id, course_id: body.course_id }),
    });
    clearTimeout(timeoutId);

    console.log("[Admin Give Access API] Backend response status:", response.status);
    console.log("[Admin Give Access API] Backend response headers:", [...response.headers.entries()]);
    const responseText = await response.text();
    console.log("[Admin Give Access API] Backend response body:", responseText);

    if (!response.ok) {
      console.error("[Admin Give Access API] Backend error details:", responseText);
      return new Response(
        JSON.stringify({
          error: "Не удалось предоставить доступ",
          status: response.status,
          details: responseText,
        }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("[Admin Give Access API] Ошибка парсинга JSON:", parseError.message, responseText);
      return new Response(
        JSON.stringify({
          error: "Неверный формат ответа от бэкенда",
          details: responseText,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[Admin Give Access API] Ошибка запроса:", { name: err.name, message: err.message });
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
      JSON.stringify({ error: err.message || "Не удалось предоставить доступ" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}