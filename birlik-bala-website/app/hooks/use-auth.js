"use client"

import { useState, useEffect } from "react"
import { clientCookies } from "@/lib/auth-cookies"

export function useAuth() {
  const [token, setToken] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Получаем токен из куки при загрузке
    const savedToken = clientCookies.get("access_token")
    setToken(savedToken)
    setIsLoading(false)
  }, [])

  const saveToken = (newToken) => {
    clientCookies.set("access_token", newToken, 7)
    setToken(newToken)
  }

  const removeToken = () => {
    clientCookies.remove("access_token")
    setToken(null)
  }

  return {
    token,
    isLoading,
    isAuthenticated,
    saveToken,
    removeToken,
  }
}
