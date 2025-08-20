const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

export async function POST(request) {
  console.log("[Admin Add Video API] Called at", new Date().toISOString());
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const token = request.cookies.get("access_token")?.value;
    const headers = { "Cookie": cookieHeader };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const formData = await request.formData();
    console.log("[Admin Add Video API] FormData entries:", [...formData.entries()]);

    const courseId = formData.get("course_id");
    if (!courseId) {
      return new Response(
        JSON.stringify({ error: "Не указан ID курса" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const videos = formData.getAll("videos"); // массив файлов
    const titles = formData.getAll("titles"); // массив названий
    if (videos.length === 0) {
      return new Response(
        JSON.stringify({ error: "no files uploaded" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    if (videos.length !== titles.length) {
      return new Response(
        JSON.stringify({ error: "mismatched number of videos and titles" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Формируем новый FormData для бекенда
    const uploadData = new FormData();
    uploadData.append("course_id", courseId);

    videos.forEach((video, index) => {
      uploadData.append("videos", video);
      uploadData.append("titles", titles[index] || `Урок ${index + 1}`);
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 секунд

    const response = await fetch(`${BACKEND_URL}/api/v1/admin/course/add-video`, {
      method: "POST",
      headers,
      credentials: "include",
      body: uploadData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log("[Admin Add Video API] Backend response status:", response.status);
    const responseText = await response.text();
    console.log("[Admin Add Video API] Backend response body:", responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("[Admin Add Video API] JSON parse error:", parseError.message);
      return new Response(
        JSON.stringify({
          error: "Неверный формат ответа от бэкенда",
          details: responseText.slice(0, 100) + "...",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!response.ok) {
      console.error("[Admin Add Video API] Backend error details:", data);
      return new Response(
        JSON.stringify({
          error: "Не удалось загрузить видео",
          status: response.status,
          details: data.error || responseText,
        }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("[Admin Add Video API] Request error:", { name: err.name, message: err.message });
    if (err.name === "AbortError") {
      return new Response(JSON.stringify({ error: `Таймаут подключения к ${BACKEND_URL}` }), { status: 504, headers: { "Content-Type": "application/json" } });
    }
    if (err.code === "ECONNREFUSED") {
      return new Response(JSON.stringify({ error: `Не удалось подключиться к ${BACKEND_URL}` }), { status: 503, headers: { "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
