import { NextResponse } from "next/server";

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("access_token")?.value;

  const redirect = (url, msg) => {
    const res = NextResponse.redirect(new URL(url, req.url));
    res.cookies.set("auth_message", msg, { path: "/", maxAge: 5 });
    return res;
  };

  // 🔒 Страницы, требующие авторизации
  const protectedPages = ["/courses", "/profile", "/articles"];
  if (!token && protectedPages.some(p => pathname.startsWith(p))) {
    return redirect("/auth", "Пожалуйста, авторизуйтесь");
  }

  // 🔒 Админка
  if (pathname.startsWith("/admin")) {
    try {
      const res = await fetch(`${process.env.BACKEND_URL}/api/v1/auth/user-info`, {
        headers: { Cookie: `access_token=${token}` },
      });
      if (!res.ok) return redirect("/auth", "Ошибка авторизации");

      const data = await res.json();
      if (data?.user?.role !== "admin") {
        return redirect("/courses", "Нет доступа в админку");
      }
    } catch {
      return redirect("/auth", "Ошибка авторизации");
    }
  }

  // 🔒 Проверка доступа к курсу
  if (pathname.startsWith("/courses/")) {
    if (!token) return redirect("/auth", "Пожалуйста, авторизуйтесь");

    const courseId = pathname.split("/")[2];
    try {
      const res = await fetch(`${process.env.BACKEND_URL}/api/v1/auth/course/get/${courseId}`, {
        headers: { Cookie: `access_token=${token}` },
      });
      if (!res.ok) return redirect("/courses", "У вас нет доступа к этому курсу");
    } catch {
      return redirect("/courses", "Ошибка проверки доступа");
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/courses/:path*", "/profile/:path*", "/admin/:path*"],
};
