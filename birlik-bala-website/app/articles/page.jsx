// app/articles/page.tsx
import { Button } from "@/components/ui/button";
import Action from "@/components/Action";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

// ISR - обновляем каждые 30 минут
export const revalidate = 1800;

async function getArticles() {
  try {
    const res = await fetch("http://localhost:8080/api/v1/article/get", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      console.error("[getArticles] Ошибка:", res.status, await res.text());
      return [];
    }

    const articles = await res.json();
    console.log(articles)


    return articles.map((article) => ({
      id: article.id,
      title: article.title || "Без названия",
      description: article.description || extractDescription(article.content), // Fallback description
      category: article.category || "Без категории",
      author: article.author || "Неизвестный автор",
      readTime: article.readTime ? `${article.readTime} мин` : "5 мин",
      slug: article.slug || article.id.toString(),
      image: "/placeholder.svg?height=200&width=300", // Нет image в JSON
    }));
  } catch (error) {
    console.error("[getArticles] Ошибка:", error.message);
    return [];
  }
}

export default async function ArticlesPage() {
  const articles = await getArticles(); // Получаем статьи

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Список статей</h1>
          <p className="text-lg text-gray-600">Экспертные советы и практические рекомендации для развития детей</p>
        </div>


        {/* Сетка статей */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <Card
              key={article.id}
              className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow"
              style={{ height: "480px" }}
            >
              <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 relative flex-shrink-0">
                <div className="absolute top-4 left-4">
                  <span className="bg-white bg-opacity-90 text-gray-800 px-3 py-1 rounded-full text-xs font-medium">
                    {article.category}
                  </span>
                </div>
              </div>
              <CardContent className="flex flex-col flex-1 p-6">
                <div className="h-14 mb-4">
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-2 leading-tight">
                    {article.title}
                  </h3>
                </div>
                <div className="h-16 mb-4">
                  <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                    {article.description}
                  </p>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-6 flex-shrink-0">
                  <span>{article.author}</span>
                  <span>{article.readTime}</span>
                </div>
                <div className="mt-auto">
                  <Link href={`/articles/${article.id}`}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Читать статью
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {articles.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-2xl">📄</span>
              </div>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Статьи не найдены</h3>
            <p className="text-gray-600">Попробуйте позже</p>
          </div>
        )}

        <Action />
      </div>
    </div>
  );
}

function extractDescription(html) {
  if (!html) return "Описание отсутствует";
  const text = html.replace(/<[^>]+>/g, "").trim();
  return text.length > 150 ? text.slice(0, 150) + "..." : text || "Описание отсутствует";
}