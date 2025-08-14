import { Button } from "@/components/ui/button"

import Action from "@/components/Action"
import Link from "next/link"
import CoursesClient from "@/components/CoursesClient"

// ISR - обновляем каждые 30 минут
export const revalidate = 1800

async function getCourses() {
  try {
    // Здесь будет запрос к API
    const res = await fetch("http://localhost:8080/api/v1/courses", {
      next: { revalidate: 1800 },
    })

    if (!res.ok) {
      throw new Error("Failed to fetch courses")
    }

    return res.json()
  } catch (error) {
    console.error("Error fetching courses:", error)
    // Возвращаем мок-данные при ошибке
    return [
      {
        id: 1,
        title: "Основы АВА-терапии",
        description: "Введение в прикладной анализ поведения для родителей",
        price: "Бесплатно",
        isPaid: false,
        isAvailable: true,
        duration: "2 часа",
        lessons: 8,
        students: 1250,
        image: "/placeholder.svg?height=200&width=300",
        slug: "osnovy-ava-terapii",
      },
      {
        id: 2,
        title: "Полный курс по развитию речи",
        description: "Комплексная программа развития речевых навыков у детей",
        price: "15,000₸",
        isPaid: true,
        isAvailable: false,
        duration: "8 часов",
        lessons: 24,
        students: 890,
        image: "/placeholder.svg?height=200&width=300",
        slug: "razvitie-rechi",
      },
      {
        id: 3,
        title: "Домашние упражнения",
        description: "Практические упражнения для занятий дома",
        price: "Бесплатно",
        isPaid: false,
        isAvailable: true,
        duration: "1.5 часа",
        lessons: 6,
        students: 2100,
        image: "/placeholder.svg?height=200&width=300",
        slug: "domashnie-uprazhneniya",
      },
      {
        id: 4,
        title: "Социальная адаптация",
        description: "Развитие социальных навыков и коммуникации",
        price: "12,000₸",
        isPaid: true,
        isAvailable: false,
        duration: "6 часов",
        lessons: 18,
        students: 560,
        image: "/placeholder.svg?height=200&width=300",
        slug: "socialnaya-adaptaciya",
      },
      {
        id: 5,
        title: "Поведенческие проблемы",
        description: "Работа с трудным поведением ребенка",
        price: "18,000₸",
        isPaid: true,
        isAvailable: false,
        duration: "10 часов",
        lessons: 30,
        students: 340,
        image: "/placeholder.svg?height=200&width=300",
        slug: "povedencheskie-problemy",
      },
      {
        id: 6,
        title: "Первые шаги в АВА",
        description: "Базовые принципы для начинающих родителей",
        price: "Бесплатно",
        isPaid: false,
        isAvailable: true,
        duration: "1 час",
        lessons: 4,
        students: 3200,
        image: "/placeholder.svg?height=200&width=300",
        slug: "pervye-shagi-ava",
      },
    ]
  }
}

export default async function CoursesPage() {
  const courses = await getCourses()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Курсы</h1>
          <p className="text-lg text-gray-600">Обучающие программы по развитию детей и АВА-терапии</p>
        </div>

        {/* Клиентский компонент для фильтрации */}
        <CoursesClient courses={courses} />

        {/* Призыв к действию */}
        {/* <div className="mt-16 bg-blue-50 rounded-lg p-8 text-center">;
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Нужна персональная помощь?</h2>
          <p className="text-gray-600 mb-6">
            Получите индивидуальную консультацию и рекомендации от наших специалистов
          </p>
          <Link href="/consultation">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">Записаться на консультацию</Button>
          </Link>
        </div> */}
        <Action/>
      </div>
    </div>
  )
}
