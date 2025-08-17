import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  console.log(`[Middleware] Проверка пути: ${pathname}`);

  const token = request.cookies.get("access_token")?.value;
  console.log("[Middleware] Токен:", token ? "найден" : "не найден");

  const protectedPaths = ["/courses", "/admin", "/profile", "/articles"];
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));
  const isAdminPath = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  const isApiPath = pathname.startsWith("/api/courses") || pathname.startsWith("/api/articles") || pathname.startsWith("/api/admin");

  async function checkUser(token) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/auth/user`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: AbortSignal.timeout(5000),
      });

      console.log("[Middleware] Статус ответа бэкенда:", response.status);

      if (response.status === 401) {
        console.log("[Middleware] Пользователь не авторизован (401)");
        return { isAuthenticated: false, isAdmin: false };
      }

      if (!response.ok) {
        console.error("[Middleware] Ошибка бэкенда:", response.status);
        return { isAuthenticated: false, isAdmin: false };
      }

      const data = await response.json();
      return { isAuthenticated: true, isAdmin: data.user?.role === "admin" };
    } catch (error) {
      console.error("[Middleware] Ошибка запроса к бэкенду:", error.message);
      return { isAuthenticated: false, isAdmin: false };
    }
  }

  if (isProtectedPath || isAdminPath || isApiPath) {
    if (!token) {
      console.log("[Middleware] Нет токена, перенаправление на /auth");
      return NextResponse.redirect(new URL("/auth", request.url));
    }

    const { isAuthenticated, isAdmin } = await checkUser(token);
    if (!isAuthenticated) {
      console.log("[Middleware] Пользователь не авторизован, перенаправление на /auth");
      const response = NextResponse.redirect(new URL("/auth", request.url));
      response.cookies.set("access_token", "", {
        path: "/",
        expires: new Date(0),
        httpOnly: true,
      });
      return response;
    }

    if (isAdminPath && !isAdmin) {
      console.log("[Middleware] Пользователь не админ, перенаправление на /courses");
      return NextResponse.redirect(new URL("/courses", request.url));
    }
  }

  if (token && pathname === "/auth") {
    console.log("[Middleware] Токен присутствует, перенаправление на /courses");
    return NextResponse.redirect(new URL("/courses", request.url));
  }

  console.log("[Middleware] Доступ разрешён");
  return NextResponse.next();
}

export const config = {
  matcher: ["/courses/:path*", "/admin/:path*", "/profile/:path*", "/articles/:path*", "/auth", "/api/admin/:path*", "/api/courses/:path*", "/api/articles/:path*"],
};
