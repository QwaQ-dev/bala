const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

export async function POST(request) {
  console.log("[Admin Course Create API] Called at", new Date().toISOString());
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    console.log("[Admin Course Create API] Cookies:", cookieHeader || "none");
    const token = request.cookies.get("access_token")?.value;
    const headers = {
      "Cookie": cookieHeader,
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const formData = await request.formData();
    console.log("[Admin Course Create API] FormData entries:", [...formData.entries()]);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    const response = await fetch(`${BACKEND_URL}/api/v1/admin/course/create`, {
      method: "POST",
      headers,
      credentials: "include",
      signal: controller.signal,
      body: formData,
    });
    clearTimeout(timeoutId);

    console.log("[Admin Course Create API] Backend response status:", response.status);
    console.log("[Admin Course Create API] Backend response headers:", [...response.headers.entries()]);
    const responseText = await response.text();
    console.log("[Admin Course Create API] Backend response body:", responseText);

    let data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      console.error("[Admin Course Create API] Ошибка парсинга JSON:", parseError.message, responseText);
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
      console.error("[Admin Course Create API] Backend error details:", data);
      return new Response(
        JSON.stringify({
          error: "Не удалось создать курс",
          status: response.status,
          details: data.error || responseText || "Неизвестная ошибка",
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!data.id) {
      console.warn("[Admin Course Create API] Missing course ID in response:", data);
      data.warning = "ID курса не возвращён сервером, видео не будут загружены";
    }

    return new Response(
      JSON.stringify(data),
      {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("[Admin Course Create API] Ошибка запроса:", { name: err.name, message: err.message });
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
      JSON.stringify({ error: err.message || "Внутренняя ошибка сервера" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function GET(request) {
  console.log("[Admin Courses API] GET called at", new Date().toISOString());
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    console.log("[Admin Courses API] Cookies:", cookieHeader || "none");
    const token = request.cookies.get("access_token")?.value;
    const headers = {
      "Cookie": cookieHeader,
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    const response = await fetch(`${BACKEND_URL}/api/v1/auth/course/get-with-access`, {
      method: "GET",
      headers,
      credentials: "include",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    console.log(`${response} AWODIJAWDKWAJFOIAWJFIOHAWFOIHAWFOIAOWF`)

    console.log("[Admin Courses API] Backend response status:", response.status);
    console.log("[Admin Courses API] Backend response headers:", [...response.headers.entries()]);
    const contentType = response.headers.get("content-type");
    const responseText = await response.json();
    console.log(responseText)
    console.log("[Admin Courses API] Backend response body:", responseText);

    let data;
    if (response.status >= 200 && response.status < 300) {
      if (contentType?.includes("application/json")) {
        try {
          data = responseText;
        } catch (parseError) {
          console.error("[Admin Courses API] JSON parse error:", parseError.message, responseText);
          data = { courses: [] };
        }
      } else {
        console.warn("[Admin Courses API] Non-JSON response:", responseText);
        data = { courses: [] };
      }
    } else {
      let errorData;
      if (contentType?.includes("application/json")) {
        try {
          errorData = JSON.parse(responseText);
        } catch (parseError) {
          console.error("[Admin Courses API] JSON parse error for error response:", parseError.message, responseText);
          return new Response(
            JSON.stringify({
              error: "Ошибка сервера",
              status: response.status,
              details: responseText.slice(0, 100) + "...",
            }),
            {
              status: response.status,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      } else {
        console.error("[Admin Courses API] Non-JSON error response:", responseText);
        return new Response(
          JSON.stringify({
            error: "Ошибка сервера",
            status: response.status,
            details: responseText.slice(0, 100) + "...",
          }),
          {
            status: response.status,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      console.error("[Admin Courses API] Backend error details:", errorData);
      return new Response(
        JSON.stringify({
          error: "Не удалось получить курсы",
          status: response.status,
          details: errorData.error || responseText,
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
    console.error("[Admin Courses API] Ошибка запроса:", { name: err.name, message: err.message });
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
      JSON.stringify({ error: err.message || "Не удалось получить курсы" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}