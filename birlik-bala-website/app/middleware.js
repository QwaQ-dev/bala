import { NextResponse } from "next/server"

export function middleware(request) {
  // Получаем токен из куки
  const token = request.cookies.get("access_token")?.value

  // Защищенные маршруты
  const protectedPaths = ["/courses", "/admin", "/profile"]
  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  // Если пользователь не авторизован и пытается зайти на защищенную страницу
  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL("/auth", request.url))
  }

  // Если пользователь авторизован и пытается зайти на страницу авторизации
  if (token && request.nextUrl.pathname === "/auth") {
    return NextResponse.redirect(new URL("/courses", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/courses/:path*", "/admin/:path*", "/profile/:path*", "/auth"],
}
