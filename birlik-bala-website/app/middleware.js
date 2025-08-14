import { NextResponse } from "next/server"

export function middleware(request) {
  // Получаем токен из заголовка Authorization
  const authHeader = request.headers.get("authorization")
  const token = authHeader?.replace("Bearer ", "")

  // Защищенные роуты
  const protectedPaths = ["/course", "/admin", "/profile"]
  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  if (isProtectedPath && !token) {
    // Перенаправляем на страницу авторизации
    return NextResponse.redirect(new URL("/auth", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/course/:path*", "/admin/:path*", "/profile/:path*"],
}
