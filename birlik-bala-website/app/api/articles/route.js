const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

export async function GET(request) {
  console.log("[v0] Articles API called at", new Date().toISOString());
  try {


    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${BACKEND_URL}/api/v1/article/get`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log("[v0] Backend response status:", response.status);
    const responseText = await response.json();
    console.log("[v0] Backend response body:", responseText);

    if (!response.ok) {
      console.error("[v0] Backend error details:", responseText);
      return new Response(
        JSON.stringify({
          error: "Не удалось загрузить статьи",
          status: response.status,
          details: responseText,
        }),
        { status: response.status }
      );
    }

    let data;
    try {
      data = responseText.articles
    } catch (parseError) {
      console.error("[v0] Ошибка парсинга JSON:", parseError.message);
      return new Response(
        JSON.stringify({
          error: "Неверный формат ответа от бэкенда",
          details: responseText,
        }),
        { status: 500 }
      );
    }

    console.log("[v0] Parsed data:", data);
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
    console.error("[v0] Ошибка запроса:", { name: err.name, message: err.message });
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