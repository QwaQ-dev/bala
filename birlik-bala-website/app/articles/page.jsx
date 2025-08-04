"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Header from "@/components/Header"
import Link from "next/link"
import Action from "@/components/Action"

const articles = [
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

export default function ArticlesPage() {
  const [filter, setFilter] = useState("all") // all, ava-therapy, exercises, development

  const categories = [...new Set(articles.map((article) => article.category))]

  const filteredArticles = articles.filter((article) => {
    if (filter === "АВА-терапия") return article.category === "АВА-терапия"
    if (filter === "Упражнения") return article.category === "Упражнения"
    if (filter === "Развитие") return article.category === "Развитие"
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Список статей</h1>
          <p className="text-lg text-gray-600">Экспертные советы и практические рекомендации для развития детей</p>
        </div>

        {/* Фильтры */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4 bg-white rounded-lg p-2 shadow-sm">
            <Button
              variant={filter === "all" ? "default" : "ghost"}
              onClick={() => setFilter("all")}
              className={filter === "all" ? "bg-blue-600 text-white" : ""}
            >
              Все статьи ({articles.length})
            </Button>
            <Button
              variant={filter === "АВА-терапия" ? "default" : "ghost"}
              onClick={() => setFilter("АВА-терапия")}
              className={filter === "АВА-терапия" ? "bg-green-600 text-white" : ""}
            >
              АВА-терапия ({articles.filter((a) => a.category === "АВА-терапия").length})
            </Button>
            <Button
              variant={filter === "Упражнения" ? "default" : "ghost"}
              onClick={() => setFilter("Упражнения")}
              className={filter === "Упражнения" ? "bg-orange-600 text-white" : ""}
            >
              Упражнения ({articles.filter((a) => a.category === "Упражнения").length})
            </Button>
            <Button
              variant={filter === "Развитие" ? "default" : "ghost"}
              onClick={() => setFilter("Развитие")}
              className={filter === "Развитие" ? "bg-purple-600 text-white" : ""}
            >
              Развитие ({articles.filter((a) => a.category === "Развитие").length})
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map((article) => (
            <Card
              key={article.id}
              className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow"
              style={{ height: "480px" }} // Фиксированная высота для всех карточек
            >
              <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 relative flex-shrink-0">
                <div className="absolute top-4 left-4">
                  <span className="bg-white bg-opacity-90 text-gray-800 px-3 py-1 rounded-full text-xs font-medium">
                    {article.category}
                  </span>
                </div>
              </div>

              <CardContent className="flex flex-col flex-1 p-6">
                {/* Заголовок - фиксированная высота */}
                <div className="h-14 mb-4">
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-2 leading-tight">{article.title}</h3>
                </div>

                {/* Описание - фиксированная высота */}
                <div className="h-16 mb-4">
                  <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">{article.description}</p>
                </div>

                {/* Информация об авторе и времени чтения */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-6 flex-shrink-0">
                  <span>{article.author}</span>
                  <span>{article.readTime}</span>
                </div>

                {/* Кнопка - всегда внизу */}
                <div className="mt-auto">
                  <Link href={`/articles/${article.slug}`}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Читать статью</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-2xl">📄</span>
              </div>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Статьи не найдены</h3>
            <p className="text-gray-600">Попробуйте изменить фильтр или вернитесь позже</p>
          </div>
        )}
        <Action/>
      </div>
    </div>
  )
}
