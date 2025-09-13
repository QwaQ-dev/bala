import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const revalidate = 1800; // Страница будет пересобираться каждые 30 секунд

export default function ArticlesSection({ articles = [] }) {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Полезные статьи для родителей
          </h2>
          <p className="text-lg text-gray-600">
            Экспертные советы и практические рекомендации для развития детей
          </p>
        </div>

        {/* Если статей нет */}
        {articles.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-2xl">📄</span>
              </div>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Статьи не найдены
            </h3>
            <p className="text-gray-600">Попробуйте позже</p>
          </div>
        ) : (
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
                      {Array.isArray(article.category)
                        ? article.category.join(", ")
                        : article.category || "Без категории"}
                    </span>
                  </div>
                </div>

                <CardContent className="flex flex-col flex-1 p-6">
                  {/* Заголовок */}
                  <div className="h-14 mb-4">
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-2 leading-tight">
                      {article.title}
                    </h3>
                  </div>

                  {/* Описание */}
                  <div className="h-16 mb-4">
                    <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                      {article.description}
                    </p>
                  </div>

                  {/* Автор и время чтения */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-6 flex-shrink-0">
                    <span>{article.author || "Неизвестный автор"}</span>
                    <span>{article.readTime || "5 мин"}</span>
                  </div>

                  {/* Кнопка */}
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
        )}

        {/* Кнопка "Все статьи" */}
        <div className="text-center mt-8">
          <Link href="/articles">
            <button className="text-blue-600 font-medium hover:text-blue-700 transition-colors">
              Все статьи →
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
