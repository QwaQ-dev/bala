"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Play, Lock } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CoursesClient() {
  const [courses, setCourses] = useState([])
  const [filter, setFilter] = useState("all")
  const [error, setError] = useState(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch("/api/courses", {
          method: "GET",
          credentials: "include",
        })
        if (!res.ok) {
          const errorText = await res.text()
          throw new Error(`Failed to fetch courses: ${res.status} - ${errorText}`)
        }
        console.log(res)
        const data = await res.json()
        console.log(data.received)
        if (!Array.isArray(data)) {
          throw new Error("Invalid data format received from server")
        }
        setCourses(data)
      } catch (err) {
        setError(err.message)
      }
    }
    fetchCourses()
  }, [])

  const filteredCourses = courses.filter((course) => {
    if (filter === "available") return course.has_access
    if (filter === "unavailable") return !course.has_access
    return true
  })

  const handleCourseAction = (course) => {
    if (course.has_access) {
      router.push(`/courses/${course.id}`)
    } else {
      alert(`Переход к оплате курса "${course.title}" за ${course.cost}₸`)
    }
  }

  return (
    <>
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
            Доступные ({courses.filter((c) => c.has_access).length})
          </Button>
          <Button
            variant={filter === "unavailable" ? "default" : "ghost"}
            onClick={() => setFilter("unavailable")}
            className={filter === "unavailable" ? "bg-red-600 text-white" : ""}
          >
            Недоступные ({courses.filter((c) => !c.has_access).length})
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCourses.map((course) => (
          <Card
            key={course.id}
            className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
            style={{ height: "420px" }}
          >
            <div className="relative h-48 bg-gray-100 flex-shrink-0">
              {course.img && (
                <img
                  src={`http://localhost:8080${course.img}`}                    
                  alt={course.title}
                  className="object-cover w-full h-full"
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                {course.has_access ? (
                  <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-lg">
                    <Play className="w-6 h-6 text-green-600 ml-1" />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-lg">
                    <Lock className="w-6 h-6 text-red-600" />
                  </div>
                )}
              </div>

              <div className="absolute top-4 right-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    course.has_access ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {course.has_access ? "Доступен" : `${course.cost}₸`}
                </span>
              </div>
            </div>

            <CardContent className="flex flex-col flex-1 p-6">
              <h3 className="text-xl font-bold text-gray-900 line-clamp-2 leading-tight mb-3">
                {course.title}
              </h3>

              <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed mb-6">
                {course.description}
              </p>

              <div className="mt-auto">
                <Button
                  onClick={() => handleCourseAction(course)}
                  className={`w-full flex items-center justify-center space-x-2 ${
                    course.has_access
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-red-600 hover:bg-red-700 text-white"
                  }`}
                >
                  {course.has_access ? (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Начать курс</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Купить за {course.cost}₸</span>
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
