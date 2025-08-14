"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Users, BookOpen, Eye, UserCheck } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    const token = localStorage.getItem("access_token")
    try {
      const response = await fetch("http://localhost:8080/api/v1/admin/courses", {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })
      const data = await response.json()
      setCourses(data)
    } catch (error) {
      console.error("Failed to load courses:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteCourse = async (courseId) => {
    if (!confirm("Вы уверены, что хотите удалить этот курс?")) return

    const token = localStorage.getItem("access_token")
    try {
      await fetch(`http://localhost:8080/api/v1/admin/courses/${courseId}`, {
        method: "DELETE",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })
      setCourses(courses.filter((course) => course.id !== courseId))
    } catch (error) {
      console.error("Failed to delete course:", error)
      alert("Ошибка при удалении курса")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Админ панель</h1>
          <p className="text-gray-600">Управление курсами и пользователями</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/users">
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <UserCheck className="w-4 h-4" />
              Пользователи
            </Button>
          </Link>
          <Link href="/admin/courses/new">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Создать курс
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Всего курсов</p>
                <p className="text-2xl font-bold">{courses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Всего студентов</p>
                <p className="text-2xl font-bold">{courses.reduce((sum, course) => sum + (course.students || 0), 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Всего уроков</p>
                <p className="text-2xl font-bold">
                  {courses.reduce((sum, course) => sum + (course.videos?.length || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link href="/admin/users">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-500" />
                Управление пользователями
              </CardTitle>
              <CardDescription>Просматривайте пользователей и назначайте им доступ к курсам</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/courses/new">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-500" />
                Создать новый курс
              </CardTitle>
              <CardDescription>Добавьте новый курс с видео уроками и описанием</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Courses List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Управление курсами</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <div className="aspect-video overflow-hidden rounded-t-lg bg-gray-100">
                <img
                  src={course.image || "/placeholder.svg?height=200&width=300"}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline">{course.level}</Badge>
                </div>
                <CardTitle className="text-lg leading-tight">{course.title}</CardTitle>
                <CardDescription className="line-clamp-2">{course.description}</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{course.videos?.length || 0} уроков</span>
                  <span>{course.students || 0} студентов</span>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/admin/courses/${course.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      <Edit className="w-4 h-4 mr-2" />
                      Редактировать
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteCourse(course.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {courses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Нет курсов</h3>
          <p className="text-gray-600 mb-4">Создайте свой первый курс</p>
          <Link href="/admin/courses/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Создать курс
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
