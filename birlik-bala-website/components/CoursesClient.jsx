"use client"

import { useState } from "react"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/Button"
import { Play, Lock, CheckCircle, Clock, Users } from "lucide-react"

export default function CoursesClient({ courses }) {
  const [filter, setFilter] = useState("all") // all, available, paid

  const filteredCourses = courses.filter((course) => {
    if (filter === "available") return !course.isPaid && course.isAvailable
    if (filter === "paid") return course.isPaid
    return true
  })

  const handleCourseAction = (course) => {
    if (!course.isPaid && course.isAvailable) {
      // Переход к бесплатному курсу
      window.location.href = `/courses/${course.slug}`
    } else if (course.isPaid) {
      // Покупка курса
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
            Доступные ({courses.filter((c) => !c.isPaid && c.isAvailable).length})
          </Button>
          <Button
            variant={filter === "paid" ? "default" : "ghost"}
            onClick={() => setFilter("paid")}
            className={filter === "paid" ? "bg-orange-600 text-white" : ""}
          >
            Платные ({courses.filter((c) => c.isPaid).length})
          </Button>
        </div>
      </div>

    {/* Список курсов */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCourses.map((course) => (
            <Card
                key={course.id}
                className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col"
                style={{ minHeight: "480px" }} // Set a fixed min height for all cards
            >
                {/* Изображение курса */}
                <div className="relative h-48 bg-gradient-to-br from-blue-100 to-blue-200">
                    <div className="absolute inset-0 flex items-center justify-center">
                        {!course.isPaid && course.isAvailable ? (
                            <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-lg">
                                <Play className="w-6 h-6 text-green-600 ml-1" />
                            </div>
                        ) : course.isPaid ? (
                            <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-lg">
                                <Lock className="w-6 h-6 text-orange-600" />
                            </div>
                        ) : (
                            <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-lg">
                                <CheckCircle className="w-6 h-6 text-blue-600" />
                            </div>
                        )}
                    </div>

                    {/* Бейдж цены */}
                    <div className="absolute top-4 right-4">
                        <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                                course.isPaid ? "bg-orange-100 text-orange-800" : "bg-green-100 text-green-800"
                            }`}
                        >
                            {course.price}
                        </span>
                    </div>

                    {/* Статус доступности */}
                    {!course.isPaid && course.isAvailable && (
                        <div className="absolute top-4 left-4">
                            <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">Доступен</span>
                        </div>
                    )}
                </div>

                <CardContent className="flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{course.description}</p>

                    {/* Статистика курса */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
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

                    {/* Кнопка действия */}
                    <div className="mt-auto">
                        <Button
                            onClick={() => handleCourseAction(course)}
                            className={`w-full flex items-center justify-center space-x-2 ${
                                !course.isPaid && course.isAvailable
                                    ? "bg-green-600 hover:bg-green-700 text-white"
                                    : course.isPaid
                                        ? "bg-orange-600 hover:bg-orange-700 text-white"
                                        : "bg-gray-400 text-white cursor-not-allowed"
                            }`}
                            disabled={!course.isAvailable && !course.isPaid}
                        >
                            {!course.isPaid && course.isAvailable ? (
                                <>
                                    <Play className="w-4 h-4" />
                                    <span>Начать курс</span>
                                </>
                            ) : course.isPaid ? (
                                <>
                                    <span>Купить за {course.price}</span>
                                </>
                            ) : (
                                <>
                                    <Lock className="w-4 h-4" />
                                    <span>Недоступен</span>
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
