// middleware.js
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  console.log("Middleware triggered for:", req.nextUrl.pathname);
  const token = req.cookies.get("access_token")?.value ?? null;

  const protectedPages = ["/courses", "/profile", "/articles"];
  const adminPages = ["/admin"];
  const protectedApis = ["/api/courses", "/api/articles", "/api/admin"];

  async function checkUser(token) {
    if (!token) return { isAuthenticated: false, isAdmin: false };
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/auth/user-info`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return { isAuthenticated: false, isAdmin: false };
      const data = await res.json();
      return { isAuthenticated: true, isAdmin: data.user?.role === "user" };
    } catch {
      return { isAuthenticated: false, isAdmin: false };
    }
  }

  const { isAuthenticated, isAdmin } = await checkUser(token);

  // --- API защита ---
  if (protectedApis.some(p => pathname.startsWith(p))) {
    if (!isAuthenticated) return new NextResponse(JSON.stringify({ error: "Не авторизован" }), { status: 401 });
    if (pathname.startsWith("/api/admin") && !isAdmin)
      return new NextResponse(JSON.stringify({ error: "Нет прав администратора" }), { status: 403 });
    return NextResponse.next();
  }

  // --- Страницы ---
  const redirectWithMessage = (url, message) => {
    const res = NextResponse.redirect(new URL(url, req.url));
    res.cookies.set("auth_message", message, { path: "/", maxAge: 5 });
    res.headers.set("Cache-Control", "no-store");
    return res;
  };

  // Админка
  if (adminPages.some(p => pathname.startsWith(p)) && !isAdmin) {
    return redirectWithMessage("/courses", "У вас нет доступа в админку");
  }

  // Пользовательские страницы
  if (protectedPages.some(p => pathname.startsWith(p)) && !isAuthenticated) {
    const res = redirectWithMessage("/auth", "Пожалуйста, авторизуйтесь для доступа");
    res.cookies.set("access_token", "", { path: "/", expires: new Date(0) });
    return res;
  }

  // Авторизованные не могут заходить на /auth
  if (isAuthenticated && pathname === "/auth") {
    return redirectWithMessage("/courses", "Вы уже авторизованы");
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/courses/:path*", "/profile/:path*", "/articles/:path*", "/admin/:path*", "/auth",
    "/api/courses/:path*", "/api/articles/:path*", "/api/admin/:path*",
  ],
};
