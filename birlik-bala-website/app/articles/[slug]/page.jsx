import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock, User, Calendar } from "lucide-react"
import Link from "next/link"

export const revalidate = 3600

async function getArticle(slug) {


  return {
    id: 1,
    title: "Что делать, если ребенок не говорит в 3 года",
    content: `
      <h2>Введение</h2>
      <p>Развитие речи у детей - это сложный процесс, который может происходить в разном темпе. Если ваш ребенок в 3 года еще не говорит или говорит очень мало, это может вызывать беспокойство.</p>
      
      <h2>Основные причины задержки речи</h2>
      <ul>
        <li>Индивидуальные особенности развития</li>
        <li>Недостаток стимуляции речевого развития</li>
        <li>Проблемы со слухом</li>
        <li>Неврологические особенности</li>
      </ul>
      
      <h2>Что можно делать дома</h2>
      <p>Существует множество способов стимулировать речевое развитие ребенка в домашних условиях:</p>
      
      <h3>1. Постоянно разговаривайте с ребенком</h3>
      <p>Комментируйте все, что вы делаете. Описывайте предметы, действия, эмоции.</p>
      
      <h3>2. Читайте книги</h3>
      <p>Ежедневное чтение развивает словарный запас и понимание речи.</p>
      
      <h3>3. Пойте песни и рассказывайте стихи</h3>
      <p>Ритм и мелодия помогают запоминать слова и развивают речевой слух.</p>
      
      <h2>Когда обращаться к специалисту</h2>
      <p>Если к 3 годам ребенок:</p>
      <ul>
        <li>Не произносит простые слова</li>
        <li>Не понимает простые инструкции</li>
        <li>Не проявляет интереса к общению</li>
      </ul>
      <p>Рекомендуется обратиться к логопеду или специалисту по развитию речи.</p>
    `,
    category: "АВА-терапия",
    author: "Айгуль Сарсенова",
    date: "2024-01-15",
    readTime: "5 мин",
    slug: "rebenok-ne-govorit-v-3-goda",
  }
}

export default async function ArticlePage({ params }) {
  const article = await getArticle(params.slug)

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
  )
}
