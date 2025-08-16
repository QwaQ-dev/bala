
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

export async function GET(request, { params }) {
  const { slug } = params;
  console.log("[Article API] Called for slug:", slug, "at", new Date().toISOString());

  try {
    const cookieHeader = request.headers.get("cookie") || "";
    console.log("[Article API] Cookies:", cookieHeader || "none");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const token = request.cookies.get("access_token")?.value;

    const headers = {
      "Content-Type": "application/json",
      "Cookie": cookieHeader,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/article/get/${slug}`, {
      method: "GET",
      headers,
      credentials: "include",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log("[Article API] Backend response status:", response.status);
    const responseText = await response.text();
    console.log("[Article API] Backend response body:", responseText);

    if (!response.ok) {
      console.error("[Article API] Backend error details:", responseText);
      return new Response(
        JSON.stringify({
          error: "Не удалось загрузить статью",
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
      console.error("[Article API] Ошибка парсинга JSON:", parseError.message);
      return new Response(
        JSON.stringify({
          error: "Неверный формат ответа от бэкенда",
          details: responseText,
        }),
        { status: 500 }
      );
    }

    console.log("[Article API] Parsed data:", data);
    // Expect an object for a single article, not an array
    if (typeof data !== "object" || Array.isArray(data)) {
      return new Response(
        JSON.stringify({
          error: "Неверный формат данных: ожидался объект",
          received: data,
        }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    console.error("[Article API] Ошибка запроса:", { name: err.name, message: err.message });
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
