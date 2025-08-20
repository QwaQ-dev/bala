
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

export async function GET(request, { params }) {
  const { id } = params;
  console.log("[Admin Course Get API] Called for id:", id, "at", new Date().toISOString());
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    console.log("[Admin Course Get API] Cookies:", cookieHeader || "none");
    const token = request.cookies.get("access_token")?.value;
    const headers = {
      "Cookie": cookieHeader,
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout
    const response = await fetch(`${BACKEND_URL}/api/v1/auth/course/get/${id}`, {
      method: "GET",
      headers,
      credentials: "include",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    console.log("[Admin Course Get API] Backend response status:", response.status);
    const contentType = response.headers.get("content-type");
    const responseText = await response.text();
    console.log("[Admin Course Get API] Backend response body:", responseText);

    let data;
    if (contentType && contentType.includes("application/json")) {
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("[Admin Course Get API] JSON parse error:", parseError.message, responseText);
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
    } else {
      console.error("[Admin Course Get API] Non-JSON response:", responseText);
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
      console.error("[Admin Course Get API] Backend error details:", data);
      return new Response(
        JSON.stringify({
          error: "Не удалось загрузить курс",
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
      JSON.stringify(data),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("[Admin Course Get API] Ошибка запроса:", { name: err.name, message: err.message });
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

export async function DELETE(request, { params }) {
  const { id } = params;
  console.log("[Admin Course Delete API] Called for id:", id, "at", new Date().toISOString());
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    console.log("[Admin Course Delete API] Cookies:", cookieHeader || "none");
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
    const response = await fetch(`${BACKEND_URL}/api/v1/admin/course/${id}`, {
      method: "DELETE",
      headers,
      credentials: "include",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    console.log("[Admin Course Delete API] Backend response status:", response.status);
    const responseText = await response.json();
    console.log(responseText)
    console.log("[Admin Course Delete API] Backend response body:", responseText);

    let data;
    try {
      data = responseText.course
    } catch (parseError) {
      console.error("[Admin Course Delete API] Ошибка парсинга JSON:", parseError.message);
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
      console.error("[Admin Course Delete API] Backend error details:", data);
      return new Response(
        JSON.stringify({
          error: "Не удалось удалить курс",
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
      JSON.stringify({ message: "Курс успешно удалён" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("[Admin Course Delete API] Ошибка запроса:", { name: err.name, message: err.message });
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
