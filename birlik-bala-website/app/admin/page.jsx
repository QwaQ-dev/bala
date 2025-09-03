"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2, Plus, Pencil } from "lucide-react";
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


      // Fetch Checklists
      const checklistResponse = await fetch("/api/checklists", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });
      let checklistData = await checklistResponse.json();
      checklistData = checklistData ?? [];
      if (!checklistResponse.ok) throw new Error(checklistData.error || `HTTP error (checklists): ${checklistResponse.status}`);

      // Fetch Courses
      const courseResponse = await fetch("/api/admin/courses", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });
      let courseData = await courseResponse.json();
      let coursesData = courseData.courses ?? [];
      if (!courseResponse.ok) throw new Error(courseData.error || `HTTP error (courses): ${courseResponse.status}`);

      // Fetch Articles
      const articleResponse = await fetch("/api/articles", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });
      let articleData = await articleResponse.json();
      articleData = articleData ?? [];
      if (!articleResponse.ok) throw new Error(articleData.error || `HTTP error (articles): ${articleResponse.status}`);

      setChecklists(checklistData);
      setCourses(coursesData);
      setArticles(articleData);
    } catch (error) {

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

      const response = await fetch(`/api/admin/checklists/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });

      let data = await response.text();
      data = data ? JSON.parse(data) : {};

      if (!response.ok) throw new Error(data.error || `Failed to delete checklist: ${response.status}`);

      setSuccess(`Чеклист с ID ${id} успешно удалён`);
      setChecklists(checklists.filter((checklist) => checklist.id !== id));
    } catch (error) {

      setError(error.message);
    }
  };

  const handleDeleteArticle = async (id) => {
    setError(null);
    setSuccess(null);
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("access_token="))
        ?.split("=")[1];

      const response = await fetch(`/api/admin/articles/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });

      let data = await response.text();
      data = data ? JSON.parse(data) : {};

      if (!response.ok) throw new Error(data.error || `Failed to delete article: ${response.status}`);

      setSuccess(`Статья с ID ${id} успешно удалена`);
      setArticles(articles.filter((article) => article.id !== id));
    } catch (error) {

      setError(error.message);
    }
  };

  const handleDeleteCourse = async (id) => {
    setError(null);
    setSuccess(null);
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("access_token="))
        ?.split("=")[1];

      const response = await fetch(`/api/admin/courses/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });

      let data = await response.text();
      data = data ? JSON.parse(data) : {};

      if (!response.ok) throw new Error(data.error || `Failed to delete course: ${response.status}`);

      setSuccess(`Курс с ID ${id} успешно удалён`);
      setCourses(courses.filter((course) => course.id !== id));
    } catch (error) {

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
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 mt-10">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Админ-панель</h1>
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
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <h2 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-0">Чеклисты</h2>
          <Link href="/admin/checklists/new">
            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Создать чеклист
            </Button>
          </Link>
        </div>
        {checklists.length === 0 ? (
          <div className="text-center py-8">
            <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">Чеклисты не найдены</h3>
            <p className="text-gray-600">Создайте новый чеклист</p>
          </div>
        ) : (
          <div className="space-y-4">
            {checklists.map((checklist) => (
              <Card key={checklist.id} className="flex flex-col sm:flex-row items-center justify-between p-4">
                <CardHeader className="p-0">
                  <CardTitle className="text-base sm:text-lg">{checklist.title}</CardTitle>
                  <p className="text-sm text-gray-600">{checklist.description}</p>
                  <p className="text-sm text-gray-500">Возраст: {checklist.forAge} лет</p>
                  <p className="text-sm text-gray-500">URL: {checklist.slug}</p>
                </CardHeader>
                <CardContent className="p-0 mt-2 sm:mt-0 sm:ml-4 flex flex-col sm:flex-row items-center gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteChecklist(checklist.id)}
                    className="w-full sm:w-auto"
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
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <h2 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-0">Курсы</h2>
          <Link href="/admin/courses/new">
            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Создать Курс
            </Button>
          </Link>
        </div>
        {courses.length === 0 ? (
          <div className="text-center py-8">
            <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">Курсы не найдены</h3>
            <p className="text-gray-600">Создайте новый курс на странице управления</p>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <Card key={course.id} className="flex flex-col sm:flex-row items-center justify-between p-4">
                <CardHeader className="p-0">
                  <CardTitle className="text-base sm:text-lg">{course.title}</CardTitle>
                  <p className="text-sm text-gray-600">{course.description}</p>
                  <p className="text-sm text-gray-500">Slug: {course.slug}</p>
                </CardHeader>
                <CardContent className="p-0 mt-2 sm:mt-0 sm:ml-4 flex flex-col sm:flex-row items-center gap-2">
                  <Link href={`/admin/courses/${course.id}/edit`}>
                    <Button variant="outline" className="w-full sm:w-auto">
                      <Pencil className="w-4 h-4 mr-2" />
                      Редактировать
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteCourse(course.id)}
                    className="w-full sm:w-auto"
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

      {/* Articles Section */}
      <div className="mb-12">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <h2 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-0">Статьи</h2>
          <Link href="/admin/articles/new">
            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Создать статью
            </Button>
          </Link>
        </div>
        {articles.length === 0 ? (
          <div className="text-center py-8">
            <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">Статьи не найдены</h3>
            <p className="text-gray-600">Создайте новую статью</p>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <Card key={article.id} className="flex flex-col sm:flex-row items-center justify-between p-4">
                <CardHeader className="p-0">
                  <CardTitle className="text-base sm:text-lg">{article.title}</CardTitle>
                  <p className="text-sm text-gray-600">{article.description}</p>
                  <p className="text-sm text-gray-500">Slug: {article.slug}</p>
                </CardHeader>
                <CardContent className="p-0 mt-2 sm:mt-0 sm:ml-4 flex flex-col sm:flex-row items-center gap-2">
                  <Link href={`/admin/articles/${article.id}/edit`}>
                    <Button variant="outline" className="w-full sm:w-auto">
                      <Pencil className="w-4 h-4 mr-2" />
                      Редактировать
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteArticle(article.id)}
                    className="w-full sm:w-auto"
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

      {/* Users Section */}
      <div className="mb-12">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <h2 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-0">Пользователи</h2>
          <Link href="/admin/users">
            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
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