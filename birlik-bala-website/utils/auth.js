

    export const getAuthToken = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("access_token")
    }
    return null
    }

    export const setAuthToken = (token) => {
    if (typeof window !== "undefined") {
        localStorage.setItem("access_token", token)
    }
    }

    export const removeAuthToken = () => {
    if (typeof window !== "undefined") {
        localStorage.removeItem("access_token")
    }
    }

    export const isAuthenticated = () => {
    return !!getAuthToken()
    }


    export const getCurrentUser = async () => {
    const token = getAuthToken()
    if (!token) return null

    try {
        const response = await fetch("http://localhost:8080/api/v1/auth/user/get-info", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        })

        if (response.ok) {
        return await response.json()
        } else {
        // Токен недействителен, удаляем его
        removeAuthToken()
        return null
        }
    } catch (error) {
        console.error("Failed to get current user:", error)
        removeAuthToken()
        return null
    }
    }

    // Функция для выполнения авторизованных запросов
    export const fetchWithAuth = async (url, options = {}) => {
    const token = getAuthToken()

    const config = {
        ...options,
        headers: {
        ...options.headers,
        ...(token && { Authorization: `Bearer ${token}` }),
        },
    }

    const response = await fetch(url, config)

    // Если токен недействителен, удаляем его
    if (response.status === 401) {
        removeAuthToken()
        window.location.href = "/login"
    }

    return response
    }

    // Функция для авторизации (возвращает только токен)
    export const login = async (email, password) => {
    const response = await fetch("http://localhost:8080/api/v1/user/sign-in", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (response.ok) {
        setAuthToken(data.access_token)
        return { success: true, access_token: data.access_token }
    } else {
        return { success: false, error: data.error }
    }
    }

    // Функция для регистрации (возвращает только токен)
    export const register = async (username, password) => {
    const response = await fetch("http://localhost:8080/api/v1/user/sign-up", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
    })

    const data = await response.json()

    if (response.ok) {
        setAuthToken(data.access_token)
        return { success: true, access_token: data.access_token }
    } else {
        return { success: false, error: data.error }
    }
    }
