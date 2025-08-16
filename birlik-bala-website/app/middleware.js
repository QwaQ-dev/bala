import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  console.log(`[Middleware] Проверка пути: ${pathname}`);

  // Получаем токен из куки
  const token = request.cookies.get("access_token")?.value;
  console.log("[Middleware] Токен:", token ? "найден" : "не найден");

  // Защищённые маршруты
  const protectedPaths = ["/courses", "/admin", "/profile"];
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));

  // Функция для проверки пользовательской информации
  async function checkUser(token) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/auth/user`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: AbortSignal.timeout(5000), // Таймаут 5 секунд
      });

      console.log("[Middleware] Статус ответа бэкенда:", response.status);

      if (response.status === 401) {
        console.log("[Middleware] Пользователь не авторизован (401)");
        return false;
      }

      if (!response.ok) {
        console.error("[Middleware] Ошибка бэкенда:", response.status);
        return false;
      }

      return true; // Пользователь авторизован
    } catch (error) {
      console.error("[Middleware] Ошибка запроса к бэкенду:", error.message);
      return false;
    }
  }

  // Если пользователь пытается зайти на защищённый маршрут
  if (isProtectedPath) {
    if (!token) {
      console.log("[Middleware] Нет токена, перенаправление на /auth");
      return NextResponse.redirect(new URL("/auth", request.url));
    }

    // Проверяем пользователя через бэкенд
    const isAuthenticated = await checkUser(token);
    if (!isAuthenticated) {
      console.log("[Middleware] Пользователь не авторизован, перенаправление на /auth");
      const response = NextResponse.redirect(new URL("/auth", request.url));
      // Очищаем невалидный токен
      response.cookies.set("access_token", "", {
        path: "/",
        expires: new Date(0),
        httpOnly: true,
      });
      return response;
    }
  }

  // Если есть токен и пользователь пытается зайти на /auth
  if (token && pathname === "/auth") {
    console.log("[Middleware] Токен присутствует, перенаправление на /courses");
    return NextResponse.redirect(new URL("/courses", request.url));
  }

  // Разрешаем запрос
  console.log("[Middleware] Доступ разрешён");
  return NextResponse.next();
}

export const config = {
  matcher: ["/courses/:path*", "/admin/:path*", "/profile/:path*", "/auth"],
};