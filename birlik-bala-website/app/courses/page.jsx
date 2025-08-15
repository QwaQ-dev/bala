import { Button } from "@/components/ui/button"

import Action from "@/components/Action"
import Link from "next/link"
import CoursesClient from "@/components/CoursesClient"
import getUserData from "@/app/api/user"

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
    return []
  }
}


export default async function CoursesPage() {
  const courses = await getCourses()
  getUserData();
  

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
