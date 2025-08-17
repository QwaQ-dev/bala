
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

export async function DELETE(request) {
  console.log("[Admin Remove Video API] Called at", new Date().toISOString());
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    console.log("[Admin Remove Video API] Cookies:", cookieHeader || "none");
    const token = request.cookies.get("access_token")?.value;
    const headers = {
      "Cookie": cookieHeader,
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const formData = await request.formData();
    console.log("[Admin Remove Video API] FormData entries:", [...formData.entries()]);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout
    const response = await fetch(`${BACKEND_URL}/api/v1/admin/course/remove-video`, {
      method: "DELETE",
      headers,
      credentials: "include",
      signal: controller.signal,
      body: formData,
    });
    clearTimeout(timeoutId);

    console.log("[Admin Remove Video API] Backend response status:", response.status);
    const responseText = await response.text();
    console.log("[Admin Remove Video API] Backend response body:", responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("[Admin Remove Video API] Ошибка парсинга JSON:", parseError.message);
      return new Response(
        JSON.stringify({
          error: "Неверный формат ответа от бэкенда",
          details: responseText.slice(0, 100) + "...",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!response.ok) {
      console.error("[Admin Remove Video API] Backend error details:", data);
      return new Response(
        JSON.stringify({
          error: "Не удалось удалить видео",
          status: response.status,
          details: data.error || responseText,
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ message: "Видео успешно удалено" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("[Admin Remove Video API] Ошибка запроса:", { name: err.name, message: err.message });
    if (err.name === "AbortError") {
      return new Response(
        JSON.stringify({
          error: `Таймаут подключения к ${BACKEND_URL}`,
        }),
        {
          status: 504,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    if (err.code === "ECONNREFUSED") {
      return new Response(
        JSON.stringify({
          error: `Не удалось подключиться к ${BACKEND_URL}`,
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
