export async function GET() {
  try {
    const cookieStore = await cookies()
    const cookieHeader = cookieStore.toString()
    const res = await fetch(`${BACKEND_URL}/api/v1/auth/user`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      signal: controller.signal,
    })
    // console.log(res)
    if (!res.ok) {
      const errorText = await res.text()
      return Response.json(
        {
          error: "Failed to fetch user data",
          status: res.status,
          details: errorText,
        },
        { status: res.status },
      )
    }
    const data = await res.json()
    return Response.json(data)
  } catch (err) {
    if (err.name === "AbortError") {
      return Response.json({ error: "Backend request timeout" }, { status: 504 })
    }
    if (err.code === "ECONNREFUSED") {
      return Response.json({ error: "Cannot connect to backend" }, { status: 503 })
    }
    return Response.json({ error: err.message }, { status: 500 })
  }
}