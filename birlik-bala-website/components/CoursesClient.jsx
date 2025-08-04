"use client"

import { useState } from "react"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Play, Lock, Clock, Users } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CoursesClient({ courses }) {
  const [filter, setFilter] = useState("all") // all, available, unavailable
  const router = useRouter()

  const filteredCourses = courses.filter((course) => {
    if (filter === "available") return course.isAvailable
    if (filter === "unavailable") return !course.isAvailable
    return true
  })

  const handleCourseAction = (course) => {
    if (course.isAvailable) {
      // Переход к доступному курсу через Next.js router
      router.push(`/courses/${course.slug}`)
    } else {
      // Покупка недоступного курса
      alert(`Переход к оплате курса "${course.title}" за ${course.price}`)
    }
  }

  return (
    <>
      {/* Фильтры */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-4 bg-white rounded-lg p-2 shadow-sm">
          <Button
            variant={filter === "all" ? "default" : "ghost"}
            onClick={() => setFilter("all")}
            className={filter === "all" ? "bg-blue-600 text-white" : ""}
          >
            Все курсы ({courses.length})
          </Button>
          <Button
            variant={filter === "available" ? "default" : "ghost"}
            onClick={() => setFilter("available")}
            className={filter === "available" ? "bg-green-600 text-white" : ""}
          >
            Доступные ({courses.filter((c) => c.isAvailable).length})
          </Button>
          <Button
            variant={filter === "unavailable" ? "default" : "ghost"}
            onClick={() => setFilter("unavailable")}
            className={filter === "unavailable" ? "bg-red-600 text-white" : ""}
          >
            Недоступные ({courses.filter((c) => !c.isAvailable).length})
          </Button>
        </div>
      </div>

      {/* Список курсов */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCourses.map((course) => (
          <Card
            key={course.id}
            className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
            style={{ height: "520px" }} // Фиксированная высота для всех карточек
          >
            {/* Изображение курса */}
            <div className="relative h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex-shrink-0">
              <div className="absolute inset-0 flex items-center justify-center">
                {course.isAvailable ? (
                  <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-lg">
                    <Play className="w-6 h-6 text-green-600 ml-1" />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-lg">
                    <Lock className="w-6 h-6 text-red-600" />
                  </div>
                )}
              </div>

              {/* Бейдж цены */}
              <div className="absolute top-4 right-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    course.isAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {course.isAvailable ? "Доступен" : course.price}
                </span>
              </div>

              {/* Статус доступности */}
              {course.isAvailable && (
                <div className="absolute top-4 left-4">
                  <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">Доступен</span>
                </div>
              )}
            </div>

            <CardContent className="flex flex-col flex-1 p-6">
              {/* Заголовок - фиксированная высота */}
              <div className="h-14 mb-3">
                <h3 className="text-xl font-bold text-gray-900 line-clamp-2 leading-tight">{course.title}</h3>
              </div>

              {/* Описание - фиксированная высота */}
              <div className="h-16 mb-4">
                <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">{course.description}</p>
              </div>

              {/* Статистика курса */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-6 flex-shrink-0">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Play className="w-4 h-4" />
                  <span>{course.lessons} уроков</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{course.students}</span>
                </div>
              </div>

              {/* Кнопка действия - всегда внизу */}
              <div className="mt-auto">
                <Button
                  onClick={() => handleCourseAction(course)}
                  className={`w-full flex items-center justify-center space-x-2 ${
                    course.isAvailable
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-red-600 hover:bg-red-700 text-white"
                  }`}
                >
                  {course.isAvailable ? (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Начать курс</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Купить за {course.price}</span>
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Play className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Курсы не найдены</h3>
          <p className="text-gray-600">Попробуйте изменить фильтр или вернитесь позже</p>
        </div>
      )}
    </>
  )
}
