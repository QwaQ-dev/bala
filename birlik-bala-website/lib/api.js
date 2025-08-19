const API_URL = "http://localhost:8080/api/v1"

async function request(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // This ensures HttpOnly cookies are sent automatically
  }

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  }

  try {
    console.log("[v0] Making API request to:", url)
    console.log("[v0] Request config:", config)

    const response = await fetch(url, config)
    console.log("[v0] Response status:", response.status)
    console.log("[v0] Response ok:", response.ok)

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`

      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch (parseError) {
        console.log("[v0] Could not parse error response as JSON")
      }

      console.error("[v0] API Error:", errorMessage)
      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log("[v0] API Response data:", data)
    return data
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      console.error("[v0] Network error - is the backend running?", error)
      throw new Error("Не удается подключиться к серверу. Проверьте, что backend запущен.")
    }

    console.error("[v0] API request error:", error)
    throw error
  }
}

export default request
