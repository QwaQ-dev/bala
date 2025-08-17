
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function AdminPage() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch courses
        const courseResponse = await fetch("/api/admin/courses", {
          method: "GET",
          credentials: "include",
        });
        if (!courseResponse.ok) {
          console.error("[AdminPage] Failed to fetch courses:", courseResponse.status);
          toast.error("Не удалось загрузить курсы");
        } else {
          const courseData = await courseResponse.json();
          setCourses(courseData);
        }

        // Fetch articles
        const articleResponse = await fetch("/api/articles", {
          method: "GET",
          credentials: "include",
        });
        if (!articleResponse.ok) {
          console.error("[AdminPage] Failed to fetch articles:", articleResponse.status);
          toast.error("Не удалось загрузить статьи");
        } else {
          const articleData = await articleResponse.json();
          setArticles(articleData);
        }
      } catch (error) {
        console.error("[AdminPage] Error:", error.message);
        toast.error(`Ошибка: ${error.message || "Не удалось загрузить данные"}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDeleteCourse = async (id) => {
    if (!confirm("Вы уверены, что хотите удалить курс?")) return;
    try {
      const response = await fetch(`/api/admin/courses/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        console.error("[AdminPage] Failed to delete course:", response.status);
        toast.error("Не удалось удалить курс");
        return;
      }
      setCourses(courses.filter((course) => course.id !== id));
      toast.success("Курс удалён");
    } catch (error) {
      console.error("[AdminPage] Error deleting course:", error.message);
      toast.error(`Ошибка: ${error.message || "Не удалось удалить курс"}`);
    }
  };

  const handleDeleteArticle = async (id) => {
    if (!confirm("Вы уверены, что хотите удалить статью?")) return;
    try {
      const response = await fetch(`/api/admin/articles/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        console.error("[AdminPage] Failed to delete article:", response.status);
        toast.error("Не удалось удалить статью");
        return;
      }
      setArticles(articles.filter((article) => article.id !== id));
      toast.success("Статья удалена");
    } catch (error) {
      console.error("[AdminPage] Error deleting article:", error.message);
      toast.error(`Ошибка: ${error.message || "Не удалось удалить статью"}`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Админ-панель</h1>
      
      {/* Courses Section */}
      <Card className="mb-12">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Курсы</CardTitle>
            <Link href="/admin/courses/new">
              <Button>Создать курс</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <p className="text-gray-600">Курсы не найдены</p>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="text-lg font-medium">{course.title}</h3>
                    <p className="text-sm text-gray-600">{course.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/courses/${course.id}/edit`}>
                      <Button variant="outline">Редактировать</Button>
                    </Link>
                    <Button variant="destructive" onClick={() => handleDeleteCourse(course.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Articles Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Статьи</CardTitle>
            <Link href="/admin/articles/new">
              <Button>Создать статью</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {articles.length === 0 ? (
            <p className="text-gray-600">Статьи не найдены</p>
          ) : (
            <div className="space-y-4">
              {articles.map((article) => (
                <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="text-lg font-medium">{article.title}</h3>
                    <p className="text-sm text-gray-600">{article.category} | {article.author}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/articles/${article.id}/edit`}>
                      <Button variant="outline">Редактировать</Button>
                    </Link>
                    <Button variant="destructive" onClick={() => handleDeleteArticle(article.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
