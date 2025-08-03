import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Header from "@/components/Header"
import Link from "next/link"

export const revalidate = 1800 // 30 минут

async function getArticles() {
  return [
    {
      id: 1,
      title: "Что делать, если ребенок не говорит в 3 года",
      description: "Практические советы для стимулирования речевого развития у детей дошкольного возраста",
      category: "АВА-терапия",
      author: "Айгуль Сарсенова",
      date: "2024-01-15",
      readTime: "5 мин",
      image: "/placeholder.svg?height=200&width=300",
      slug: 1,
    },
    {
      id: 2,
      title: "5 простых упражнений для развития речи",
      description: "Эффективные методы развития речевых навыков в домашних условиях",
      category: "Упражнения",
      author: "Марат Жумабеков",
      date: "2024-01-10",
      readTime: "7 мин",
      image: "/placeholder.svg?height=200&width=300",
      slug: 2,
    },
    {
      id: 3,
      title: "Как развивать социальные навыки у детей",
      description: "Пошаговое руководство по развитию коммуникативных способностей",
      category: "Развитие",
      author: "Алия Нурланова",
      date: "2024-01-05",
      readTime: "6 мин",
      image: "/placeholder.svg?height=200&width=300",
      slug: 3,
    },
  ]
}

export default async function ArticlesPage({ searchParams }) {
  const articles = await getArticles()
  const categories = [...new Set(articles.map((article) => article.category))]
  const selectedCategory = searchParams?.category || "Все статьи"

  const filteredArticles =
    selectedCategory === "Все статьи"
      ? articles
      : articles.filter((a) => a.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header/>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Список статей</h1>
          <p className="text-lg text-gray-600">Экспертные советы и практические рекомендации для развития детей</p>
        </div>
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Link href="/articles">
            <Button
              variant="outline"
              className={
                selectedCategory === "Все статьи"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "hover:bg-blue-50 bg-transparent"
              }
            >
              Все статьи
            </Button>
          </Link>
          {categories.map((category) => (
            <Link
              key={category}
              href={`/articles?category=${encodeURIComponent(category)}`}
            >
              <Button
                variant="outline"
                className={
                  selectedCategory === category
                    ? "bg-blue-600 text-white border-blue-600"
                    : "hover:bg-blue-50 bg-transparent"
                }
              >
                {category}
              </Button>
            </Link>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map((article) => (
            <Card
              key={article.id}
              className="flex flex-col h-full min-h-[420px] overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 relative">
                <div className="absolute top-4 left-4">
                  <span className="bg-white bg-opacity-90 text-gray-800 px-3 py-1 rounded-full text-xs font-medium">
                    {article.category}
                  </span>
                </div>
              </div>
              <CardContent className="flex flex-col flex-1 justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 my-4 line-clamp-2">{article.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{article.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{article.author}</span>
                    <span>{article.readTime}</span>
                  </div>
                </div>
                <Link href={`/articles/${article.slug}`}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2">Читать статью</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}