const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

export async function POST(request) {
  try {
    const body = await request.json();
    const cookieHeader = request.headers.get("cookie") || "";

    const response = await fetch(`${BACKEND_URL}/api/v1/user/sign-up`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieHeader,
      },
      credentials: "include",
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(errorText, { status: response.status });
    }

    // Переносим Set-Cookie от бэкенда в ответ
    const setCookie = response.headers.get("set-cookie");
    console.log("[sign-up] Set-Cookie:", setCookie || "None");

    const headers = new Headers();
    if (setCookie) {
      headers.append("Set-Cookie", setCookie);
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), { headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}