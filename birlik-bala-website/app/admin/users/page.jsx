"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Users, BookOpen, Settings, Plus, Minus } from "lucide-react"
import Link from "next/link"
import { fetchWithAuth } from "@/utils/auth"

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState(null)
  const [userCourses, setUserCourses] = useState([])
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    loadUsers()
    loadCourses()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await fetchWithAuth("http://localhost:8080/api/v1/admin/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Failed to load users:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadCourses = async () => {
    try {
      const response = await fetchWithAuth("http://localhost:8080/api/v1/admin/courses")
      if (response.ok) {
        const data = await response.json()
        setCourses(data)
      }
    } catch (error) {
      console.error("Failed to load courses:", error)
    }
  }

  const loadUserCourses = async (userId) => {
    try {
      const response = await fetchWithAuth(`http://localhost:8080/api/v1/admin/users/${userId}/courses`)
      if (response.ok) {
        const data = await response.json()
        setUserCourses(data)
      }
    } catch (error) {
      console.error("Failed to load user courses:", error)
    }
  }

  const toggleCourseAccess = async (userId, courseId, hasAccess) => {
    try {
      const endpoint = hasAccess
        ? `http://localhost:8080/api/v1/admin/users/${userId}/courses/${courseId}/revoke`
        : `http://localhost:8080/api/v1/admin/users/${userId}/courses/${courseId}/grant`

      const response = await fetchWithAuth(endpoint, {
        method: "POST",
      })

      if (response.ok) {
        // Обновляем список курсов пользователя
        loadUserCourses(userId)
        // Обновляем список пользователей для отображения изменений
        loadUsers()
      } else {
        alert("Ошибка при изменении доступа к курсу")
      }
    } catch (error) {
      console.error("Failed to toggle course access:", error)
      alert("Ошибка при изменении доступа к курсу")
    }
  }

  const openUserDialog = async (user) => {
    setSelectedUser(user)
    await loadUserCourses(user.id)
    setDialogOpen(true)
  }

  const filteredUsers = users.filter(
    (user) =>
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getInitials = (name) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getUserCourseIds = () => {
    return userCourses.map((course) => course.id)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Управление пользователями</h1>
          <p className="text-gray-600">Назначайте доступ к курсам и управляйте пользователями</p>
        </div>
        <Link href="/admin">
          <Button variant="outline">← Назад к админ панели</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Всего пользователей</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Активных курсов</p>
                <p className="text-2xl font-bold">{courses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Всего доступов</p>
                <p className="text-2xl font-bold">{users.reduce((sum, user) => sum + (user.coursesCount || 0), 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <Input
            placeholder="Поиск пользователей..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name || user.username} />
                  <AvatarFallback>{getInitials(user.name || user.username)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">{user.name || user.username}</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role || "user"}</Badge>
                  <Badge variant="outline">{user.coursesCount || 0} курсов</Badge>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Dialog open={dialogOpen && selectedUser?.id === user.id} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => openUserDialog(user)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Управление доступом
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Управление доступом к курсам</DialogTitle>
                      <DialogDescription>
                        Пользователь: {selectedUser?.name || selectedUser?.username} ({selectedUser?.email})
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {courses.map((course) => {
                        const hasAccess = getUserCourseIds().includes(course.id)
                        return (
                          <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <img
                                src={course.image || "/placeholder.svg?height=50&width=50"}
                                alt={course.title}
                                className="w-12 h-12 rounded object-cover"
                              />
                              <div>
                                <h4 className="font-medium">{course.title}</h4>
                                <p className="text-sm text-gray-600">{course.level}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Badge variant={hasAccess ? "default" : "secondary"}>
                                {hasAccess ? "Есть доступ" : "Нет доступа"}
                              </Badge>
                              <Button
                                size="sm"
                                variant={hasAccess ? "destructive" : "default"}
                                onClick={() => toggleCourseAccess(selectedUser.id, course.id, hasAccess)}
                              >
                                {hasAccess ? (
                                  <>
                                    <Minus className="w-4 h-4 mr-1" />
                                    Отозвать
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-4 h-4 mr-1" />
                                    Предоставить
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Пользователи не найдены</h3>
          <p className="text-gray-600">Попробуйте изменить поисковый запрос</p>
        </div>
      )}
    </div>
  )
}
