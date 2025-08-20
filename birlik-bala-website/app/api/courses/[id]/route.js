const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

export async function GET(request, { params }) {
  console.log("[Course API] GET called for course ID:", params.id, "at", new Date().toISOString());

  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const token = request.cookies.get("access_token")?.value;
    const headers = {
      "Cookie": cookieHeader,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    const response = await fetch(`${BACKEND_URL}/api/v1/auth/course/get/${params.id}`, {
      method: "GET",
      headers,
      credentials: "include",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const contentType = response.headers.get("content-type");
    let data;

    if (contentType?.includes("application/json")) {
      try {
        data = await response.json();
      } catch (err) {
        console.error("[Course API] JSON parse error:", err);
        return new Response(
          JSON.stringify({ error: "Неверный формат ответа от сервера" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    } else {
      const text = await response.text();
      data = { message: text || "Курс получен" };
    }

    if (!response.ok) {
      console.error("[Course API] Backend returned error:", data);
      return new Response(
        JSON.stringify({
          error: "Не удалось получить курс",
          status: response.status,
          details: data.error || JSON.stringify(data),
        }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    // Если пришёл валидный JSON с курсом
    return new Response(
      JSON.stringify(data.course),
      { status: response.status, headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("[Course API] Request error:", { name: err.name, message: err.message });
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
      JSON.stringify({ error: err.message || "Не удалось получить курс" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
