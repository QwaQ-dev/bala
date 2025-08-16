
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, User, Calendar } from "lucide-react";
import Link from "next/link";

export const revalidate = 3600;

async function getArticle(slug) {
  try {
    const res = await fetch(`http://localhost:3000/api/articles/${slug}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // For OVT (access_token)
    });

    if (!res.ok) {
      console.error("[getArticle] Ошибка:", res.status, await res.text());
      return null;
    }

    const article = await res.json();

    // Format data to match ArticlePage expectations and JSON
    return {
      id: article.id,
      title: article.title || "Без названия",
      content: article.content || "", // Backend returns plain text
      category: article.category || "Без категории",
      author: article.author || "Неизвестный автор",
      date: article.date || new Date().toISOString().split("T")[0], // Fallback if date is absent
      readTime: article.readTime ? `${article.readTime} мин` : "5 мин",
      slug: article.id || article.id.toString(),
    };
  } catch (error) {
    console.error("[getArticle] Ошибка:", error.message);
    return null;
  }
}

export default async function ArticlePage({ params }) {
  const article = await getArticle(params.slug);

  if (!article) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Статья не найдена</h3>
          <Link href="/articles">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Назад к статьям
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Навигация назад */}
        <Link href="/articles" className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span>Назад к статьям</span>
        </Link>

        {/* Заголовок статьи */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">{article.category}</span>
            <div className="flex items-center space-x-1">
              <User className="w-4 h-4" />
              <span>{article.author}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(article.date).toLocaleDateString("ru-RU")}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{article.readTime}</span>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 leading-tight">{article.title}</h1>
        </div>

        {/* Содержание статьи */}
        <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />

        {/* Призыв к действию */}
        <div className="mt-12 p-6 bg-blue-50 rounded-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Нужна персональная консультация?</h3>
          <p className="text-gray-600 mb-4">Получите индивидуальные рекомендации от наших специалистов</p>
          <Link href="/consultation">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">Записаться на консультацию</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
