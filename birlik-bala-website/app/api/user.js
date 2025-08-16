// app/api/user.js
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

export async function getUserData() {
  console.log("[v0] getUserData called at", new Date().toISOString());
  try {
    const cookieHeader = (await import("next/headers")).cookies().get("access_token")?.value || "";
    console.log("[v0] User cookie:", cookieHeader);

    const response = await fetch(`${BACKEND_URL}/api/v1/auth/user-info`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieHeader ? `access_token=${cookieHeader}` : "",
      },
      credentials: "include",
    });

    // console.log("[v0] User response status:", response.status);
    if (!response.ok) {
      const errorText = await response.text();
    //   console.error("[v0] User fetch error:", errorText);
      return {};
    }

    const data = await response.json();
    console.log("[v0] User data:", data);
    return data || {};

  } catch (err) {
    console.error("[v0] User fetch failed:", err);
    return {};
  }
}