// app/api/user.js
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

export async function getUserData() {

  try {
    const cookieHeader =
      (await import("next/headers")).cookies().get("access_token")?.value || "";


    const response = await fetch(`${BACKEND_URL}/api/v1/auth/user-info`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader ? `access_token=${cookieHeader}` : "",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text();

      return {};
    }

    // ✅ безопасный JSON-парсинг
    let data = {};
    try {
      const text = await response.text();
      data = text ? JSON.parse(text) : {};
    } catch (parseErr) {

      data = {};
    }


    return data;
  } catch (err) {

    return {};
  }
}
