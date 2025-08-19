"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2, Plus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

export default function AdminDashboard() {
  const [checklists, setChecklists] = useState([]);
  const [courses, setCourses] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("access_token="))
        ?.split("=")[1];
      console.log("[AdminDashboard] Access token:", token || "none");

      // Fetch Checklists
      const checklistResponse = await fetch("/api/checklists", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });
      console.log("[AdminDashboard] Fetch checklists response status:", checklistResponse.status);
      const checklistData = await checklistResponse.json();
      console.log("[AdminDashboard] Fetch checklists response body:", checklistData);

      if (!checklistResponse.ok) {
        console.error("[AdminDashboard] Failed to fetch checklists:", checklistResponse.status, checklistData);
        throw new Error(checklistData.error || `HTTP error (checklists): ${checklistResponse.status}`);
      }

      if (!Array.isArray(checklistData)) {
        console.error("[AdminDashboard] Expected checklists array:", checklistData);
        throw new Error("Invalid checklists data format");
      }

      // Fetch Courses
      const courseResponse = await fetch("/api/admin/courses", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });
      console.log("[AdminDashboard] Fetch courses response status:", courseResponse.status);
      const courseData = await courseResponse.json();
      console.log("[AdminDashboard] Fetch courses response body:", courseData);

      if (!courseResponse.ok) {
        console.error("[AdminDashboard] Failed to fetch courses:", courseResponse.status, courseData);
        throw new Error(courseData.error || `HTTP error (courses): ${courseResponse.status}`);
      }

      if (!Array.isArray(courseData)) {
        console.error("[AdminDashboard] Expected courses array:", courseData);
        throw new Error("Invalid courses data format");
      }

      // Fetch Articles
      const articleResponse = await fetch("/api/articles", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });
      console.log("[AdminDashboard] Fetch articles response status:", articleResponse.status);
      const articleData = await articleResponse.json();
      console.log(articleData)
      console.log("[AdminDashboard] Fetch articles response body:", articleData);

      if (!articleResponse.ok) {
        console.error("[AdminDashboard] Failed to fetch articles:", articleResponse.status, articleData);
        throw new Error(articleData.error || `HTTP error (articles): ${articleResponse.status}`);
      }

      if (!Array.isArray(articleData)) {
        console.error("[AdminDashboard] Expected articles array:", articleData);
        throw new Error("Invalid articles data format");
      }

      if (checklistData.checklists === null || checklistData.checklist === undefined){
        setChecklists([])
      }
      setChecklists(checklistData);
      setCourses(courseData);
      setArticles(articleData);
    } catch (error) {
      console.error("[AdminDashboard] Failed to load data:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChecklist = async (id) => {
    setError(null);
    setSuccess(null);
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("access_token="))
        ?.split("=")[1];
      console.log("[AdminDashboard] Access token for delete checklist:", token || "none");

      const response = await fetch(`/api/admin/checklists/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });
      console.log("[AdminDashboard] Delete checklist response status:", response.status);
      const responseText = await response.text();
      console.log("[AdminDashboard] Delete checklist response body:", responseText);

      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error("[AdminDashboard] JSON parse error:", parseError.message, responseText);
        throw new Error("Invalid response format from server");
      }

      if (!response.ok) {
        console.error("[AdminDashboard] Failed to delete checklist:", response.status, data);
        throw new Error(data.error || `Failed to delete checklist: ${response.status}`);
      }

      console.log("[AdminDashboard] Checklist deleted successfully:", id);
      setSuccess(`Чеклист с ID ${id} успешно удалён`);
      setChecklists(checklists.filter((checklist) => checklist.id !== id));
    } catch (error) {
      console.error("[AdminDashboard] Delete checklist error:", error.message);
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Админ-панель</h1>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Ошибка</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert variant="default" className="mb-4 bg-green-100 text-green-800">
          <AlertTitle>Успех</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Checklists Section */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Чеклисты</h2>
          <Link href="/admin/checklists/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Создать чеклист
            </Button>
          </Link>
        </div>
        {checklists.length === 0 ? (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Чеклисты не найдены</h3>
            <p className="text-gray-600">Создайте новый чеклист</p>
          </div>
        ) : (
          <div className="space-y-4">
            {checklists.map((checklist) => (
              <Card key={checklist.id} className="flex items-center justify-between">
                <CardHeader>
                  <CardTitle>{checklist.title}</CardTitle>
                  <p className="text-sm text-gray-600">{checklist.description}</p>
                  <p className="text-sm text-gray-500">Возраст: {checklist.forAge} лет</p>
                  <p className="text-sm text-gray-500">Slug: {checklist.slug}</p>
                  <p className="text-sm text-gray-500 truncate">URL: {checklist.url}</p>
                </CardHeader>
                <CardContent className="flex items-center gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteChecklist(checklist.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Удалить
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Courses Section */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Курсы</h2>
          <Link href="/admin/courses/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Создать Курс
            </Button>
          </Link>
        </div>
        {courses.length === 0 ? (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Курсы не найдены</h3>
            <p className="text-gray-600">Создайте новый курс на странице управления</p>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <Card key={course.id} className="flex items-center justify-between">
                <CardHeader>
                  <CardTitle>{course.title}</CardTitle>
                  <p className="text-sm text-gray-600">{course.description}</p>
                  <p className="text-sm text-gray-500">Slug: {course.slug}</p>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Articles Section */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Статьи</h2>
          <Link href="/admin/articles/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Создать статью
            </Button>
          </Link>
        </div>
        {articles.length === 0 ? (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Статьи не найдены</h3>
            <p className="text-gray-600">Создайте новую статью</p>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <Card key={article.id} className="flex items-center justify-between">
                <CardHeader>
                  <CardTitle>{article.title}</CardTitle>
                  <p className="text-sm text-gray-600">{article.description}</p>
                  <p className="text-sm text-gray-500">Slug: {article.slug}</p>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Users Section */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Пользователи</h2>
          <Link href="/admin/users">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Управление пользователями
            </Button>
          </Link>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-600">Перейдите в раздел управления пользователями для настройки доступов</p>
        </div>
      </div>
    </div>
  );
}