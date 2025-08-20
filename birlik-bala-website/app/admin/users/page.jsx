"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, BookOpen, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState({});
  const [courseLoadError, setCourseLoadError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setCourseLoadError(null);

    try {
      await loadCourses();
      await loadUsers();
    } catch (error) {
      console.error("[AdminUsersPage] Failed to load data:", error.message);
      alert("Ошибка при загрузке данных: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      let response = await fetch("/api/admin/courses", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) {
        console.warn("[AdminUsersPage] Failed to load admin courses, falling back to /api/courses:", response.status, await response.text());
        response = await fetch("/api/courses", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (!response.ok) {
          console.error("[AdminUsersPage] Failed to load courses:", response.status, await response.text());
          setCourseLoadError("Не удалось загрузить курсы. Проверьте базу данных или доступ.");
          return;
        }
      }
      const data = await response.json();
      console.log("[AdminUsersPage] Courses data:", data);
      if (data.length === 0) {
        setCourseLoadError("Список курсов пуст. Добавьте курсы в систему.");
      }
      setCourses(data.courses);
    } catch (error) {
      console.error("[AdminUsersPage] Failed to load courses:", error.message);
      setCourseLoadError("Ошибка при загрузке курсов: " + error.message);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) {
        console.error("[AdminUsersPage] Failed to load users:", response.status, await response.text());
        return;
      }
      const data = await response.json();
      console.log("[AdminUsersPage] Raw users data:", data);
      const processedUsers = await Promise.all(
        data.map(async (user) => {
          let courseIds = Array.isArray(user.CourseIDs) ? [...new Set(user.CourseIDs)] : [];
          if (Array.isArray(user.CourseIDs) && user.CourseIDs.length !== courseIds.length) {
            console.warn(`[AdminUsersPage] User ${user.id} (${user.username}) has duplicate CourseIDs:`, user.CourseIDs);
          }
          const validCourses = await Promise.all(
            courseIds.map(async (courseId) => {
              let course = courses.find((c) => c.id === courseId);
              if (!course) {
                try {
                  const courseResponse = await fetch(`/api/admin/courses/${courseId}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                  });
                  if (courseResponse.ok) {
                    course = await courseResponse.json();
                    setCourses((prev) => {
                      if (!prev.some((c) => c.id === course.id)) {
                        return [...prev, course];
                      }
                      return prev;
                    });
                  }
                } catch (error) {
                  console.error(`[AdminUsersPage] Failed to fetch course ${courseId}:`, error.message);
                }
              }
              return course || { id: courseId, title: `Course ID: ${courseId} (Not Found)`, slug: '', isMissing: true };
            })
          );
          if (courseIds.length > validCourses.filter((c) => !c.isMissing).length) {
            console.warn(`[AdminUsersPage] User ${user.id} (${user.username}) has invalid CourseIDs:`, {
              invalidIds: courseIds.filter((id) => !validCourses.find((c) => c.id === id && !c.isMissing)),
              allCourseIds: courseIds,
              availableCourses: courses.map((c) => c.id),
            });
          }
          if (user.password) {
            console.warn(`[AdminUsersPage] Security: Password field returned for user ${user.id} (${user.username})`);
          }
          return {
            ...user,
            courses: validCourses.filter((c) => c),
            password: undefined,
          };
        })
      );
      setUsers(processedUsers);
    } catch (error) {
      console.error("[AdminUsersPage] Failed to load users:", error.message);
    }
  };

  const giveAccess = async (user_id, course_id) => {
    const course = courses.find((c) => c.id === parseInt(course_id));
    if (!course || course.isMissing) {
      console.error("[AdminUsersPage] Invalid course:", course_id);
      alert("Курс не существует");
      return;
    }
    try {
      console.log("[AdminUsersPage] Giving access:", { user_id, course_id });
      const response = await fetch("/api/admin/courses/give-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ user_id, course_id }),
      });
      console.log("[AdminUsersPage] Give access response status:", response.status);
      const responseText = await response.text();
      console.log("[AdminUsersPage] Give access response body:", responseText);

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (parseError) {
          console.error("[AdminUsersPage] Failed to parse error response:", parseError.message, responseText);
          alert("Ошибка при предоставлении доступа: Неверный формат ответа");
          return;
        }
        console.error("[AdminUsersPage] Failed to give access:", response.status, errorData);
        alert(`Ошибка при предоставлении доступа: ${errorData.error || "Неизвестная ошибка"}`);
        return;
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("[AdminUsersPage] Failed to parse success response:", parseError.message, responseText);
        alert("Ошибка: Неверный формат ответа от сервера");
        return;
      }

      alert(data.message || "Доступ предоставлен");
      setUsers(
        users.map((user) =>
          user.id === user_id
            ? { ...user, courses: [...(user.courses || []), course] }
            : user
        )
      );
      await loadUsers(); // Refresh users to confirm backend state
    } catch (error) {
      console.error("[AdminUsersPage] Failed to give access:", error.message);
      alert("Ошибка при предоставлении доступа: " + error.message);
    }
  };

  const takeAwayAccess = async (user_id, course_id) => {
    const course = courses.find((c) => c.id === course_id);
    if (!course || course.isMissing) {
      alert("Курс не существует, удаление записи...");
      setUsers(
        users.map((user) =>
          user.id === user_id ? { ...user, courses: user.courses.filter((c) => c.id !== course_id) } : user
        )
      );
      try {
        const response = await fetch("/api/admin/courses/take-away-access", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ user_id, course_id }),
        });
        if (!response.ok) {
          console.error("[AdminUsersPage] Failed to clean invalid course:", response.status, await response.text());
        }
      } catch (error) {
        console.error("[AdminUsersPage] Error cleaning invalid course:", error.message);
      }
      return;
    }
    if (!confirm("Вы уверены, что хотите отозвать доступ к этому курсу?")) return;
    try {
      const response = await fetch("/api/admin/courses/take-away-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ user_id, course_id }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("[AdminUsersPage] Failed to take away access:", response.status, errorData);
        alert(`Ошибка при отзыве доступа: ${errorData.error || "Неизвестная ошибка"}`);
        return;
      }
      const data = await response.json();
      alert(data.message || "Доступ отозван");
      setUsers(
        users.map((user) =>
          user.id === user_id ? { ...user, courses: user.courses.filter((c) => c.id !== course_id) } : user
        )
      );
      await loadUsers();
    } catch (error) {
      console.error("[AdminUsersPage] Failed to take away access:", error.message);
      alert("Ошибка при отзыве доступа: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Управление пользователями</h1>
          <p className="text-gray-600">Назначение и отзыв доступа к курсам</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={loadData} disabled={loading}>
            {loading ? "Обновление..." : "Обновить данные"}
          </Button>
          <Link href="/admin">
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <Users className="w-4 h-4" />
              Назад к админ-панели
            </Button>
          </Link>
        </div>
      </div>

      {courseLoadError && (
        <div className="mb-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          <p>{courseLoadError}</p>
          <Button variant="outline" size="sm" onClick={loadCourses}>
            Повторить загрузку
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Всего пользователей</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Курсов с доступом</p>
                <p className="text-2xl font-bold">{users.reduce((sum, user) => sum + (user.courses?.filter((c) => !c.isMissing).length || 0), 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Список пользователей</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg leading-tight">{user.username}</CardTitle>
                <Badge variant="outline">{user.role}</Badge>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Доступные курсы:</p>
                  {user.courses?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {user.courses.map((course) => (
                        <Badge
                          key={course.id}
                          variant={course.isMissing ? "destructive" : "secondary"}
                          className="flex items-center gap-1"
                        >
                          {course.title}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1 h-6"
                            onClick={() => takeAwayAccess(user.id, course.id)}
                          >
                            <XCircle className="w-4 h-4 text-red-600" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Нет курсов</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedCourse[user.id] || ""}
                    onValueChange={(value) => setSelectedCourse({ ...selectedCourse, [user.id]: value })}
                    disabled={courses.length === 0 || courses.every((c) => c.isMissing)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder={courses.length === 0 ? "Нет доступных курсов" : "Выберите курс"} />
                    </SelectTrigger>
                    <SelectContent>
                      {courses
                        .filter((course) => !course.isMissing)
                        .map((course) => (
                          <SelectItem key={course.id} value={course.id.toString()}>
                            {course.title}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    onClick={() => giveAccess(user.id, parseInt(selectedCourse[user.id]))}
                    disabled={!selectedCourse[user.id] || user.courses?.some((c) => c.id === parseInt(selectedCourse[user.id]))}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Дать доступ
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Пользователи не найдены</h3>
          <p className="text-gray-600 mb-4">Добавьте пользователей в систему</p>
        </div>
      )}
    </div>
  );
}