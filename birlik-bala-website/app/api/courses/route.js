const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

export async function GET(request) {
  console.log("[v0] Courses API called at", new Date().toISOString());
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    console.log("[v0] Cookies received:", cookieHeader); // Проверяем наличие access_token

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${BACKEND_URL}/api/v1/auth/course/get-with-access`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieHeader,
      },
      signal: controller.signal,
      credentials: "include",
    });
    console.log(response)

    clearTimeout(timeoutId);
    console.log("[v0] Backend response status:", response.status);
    const responseText = await response.text(); // Получаем полный текст ответа
    console.log("[v0] Backend response body:", responseText);

    if (!response.ok) {
      console.error("[v0] Backend error details:", responseText);
      return new Response(JSON.stringify({
        error: "Failed to fetch courses",
        status: response.status,
        details: responseText,
      }), { status: response.status });
    }

    let data;
    try {
      data = JSON.parse(responseText); // Пробуем парсить JSON
    } catch (parseError) {
      console.error("[v0] JSON parse error:", parseError.message);
      return new Response(JSON.stringify({
        error: "Invalid response format from backend",
        details: responseText,
      }), { status: 500 });
    }

    console.log("[v0] Parsed data:", data);
    if (!Array.isArray(data)) {
      return new Response(JSON.stringify({
        error: "Invalid data format: expected an array",
        received: data,
      }), { status: 500 });
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    console.error("[v0] Fetch error:", { name: err.name, message: err.message });
    if (err.name === "AbortError") {
      return new Response(JSON.stringify({
        error: `Timeout connecting to ${BACKEND_URL}`,
      }), { status: 504 });
    }
    if (err.code === "ECONNREFUSED") {
      return new Response(JSON.stringify({
        error: `Cannot connect to ${BACKEND_URL}`,
      }), { status: 503 });
    }
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}