import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

export default function ArticlesSection() {
  const articles = [
    {
      title: "Что делать, если ребенок не говорит в 3 года",
      description: "Практические советы для стимулирования речевого развития у детей дошкольного возраста",
      gradient: "bg-gradient-to-br from-green-400 to-green-600",
      readTime: "Читать 5 минут",
      category: "АВА-терапия",
    },
    {
      title: "5 простых упражнений для развития речи",
      description: "Эффективные методы развития речевых навыков в домашних условиях без специального оборудования",
      gradient: "bg-gradient-to-br from-orange-400 to-orange-600",
      readTime: "Читать 7 минут",
      category: "Упражнения",
    },
    {
      title: "Как развивать социальные навыки у детей",
      description: "Пошаговое руководство по развитию коммуникативных способностей и социальной адаптации",
      gradient: "bg-gradient-to-br from-purple-400 to-purple-600",
      readTime: "Читать 6 минут",
      category: "Развитие",
    },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Полезные статьи для родителей</h2>
          <p className="text-lg text-gray-600">Экспертные советы и практические рекомендации для развития детей</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((article, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group">
              <div className={`h-48 ${article.gradient} relative`}>
                <div className="absolute inset-0 bg-black bg-opacity-10 group-hover:bg-opacity-20 transition-all"></div>
                <div className="absolute top-4 left-4">
                  <span className="bg-white bg-opacity-90 text-gray-800 px-3 py-1 rounded-full text-xs font-medium">
                    {article.category}
                  </span>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">{article.title}</h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">{article.description}</p>
                <div className="text-sm text-blue-600 font-medium">{article.readTime}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/articles">
            <button className="text-blue-600 font-medium hover:text-blue-700 transition-colors">Все статьи →</button>
          </Link>
        </div>
      </div>
    </section>
  )
}
