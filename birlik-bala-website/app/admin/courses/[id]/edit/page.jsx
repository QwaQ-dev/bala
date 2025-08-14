"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import Link from "next/link"

export default function EditCoursePage({ params }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [course, setCourse] = useState(null)

  useEffect(() => {
    loadCourse()
  }, [params.id])

  const loadCourse = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${params.id}`)
      const data = await response.json()
      setCourse(data)
    } catch (error) {
      console.error("Failed to load course:", error)
    } finally {
      setLoading(false)
    }
  }

  const addVideo = () => {
    setCourse({
      ...course,
      videos: [
        ...course.videos,
        {
          id: Date.now().toString(),
          title: "",
          description: "",
          duration: 0,
          videoUrl: "",
          order: course.videos.length,
        },
      ],
    })
  }

  const removeVideo = (videoId) => {
    setCourse({
      ...course,
      videos: course.videos.filter((video) => video.id !== videoId),
    })
  }

  const updateVideo = (videoId, field, value) => {
    setCourse({
      ...course,
      videos: course.videos.map((video) => (video.id === videoId ? { ...video, [field]: value } : video)),
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/admin/courses/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(course),
      })

      if (response.ok) {
        router.push("/admin")
      } else {
        alert("Ошибка при сохранении курса")
      }
    } catch (error) {
      console.error("Failed to update course:", error)
      alert("Ошибка при сохранении курса")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="space-y-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Курс не найден</h1>
          <Link href="/admin">
            <Button>Вернуться к списку курсов</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Редактировать курс</h1>
          <p className="text-gray-600">Изменение информации о курсе и видео уроках</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Название курса</Label>
              <Input
                id="title"
                value={course.title}
                onChange={(e) => setCourse({ ...course, title: e.target.value })}
                placeholder="Введите название курса"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={course.description}
                onChange={(e) => setCourse({ ...course, description: e.target.value })}
                placeholder="Опишите содержание курса"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="level">Уровень сложности</Label>
                <Select value={course.level} onValueChange={(value) => setCourse({ ...course, level: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Начинающий">Начинающий</SelectItem>
                    <SelectItem value="Средний">Средний</SelectItem>
                    <SelectItem value="Продвинутый">Продвинутый</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="image">URL изображения</Label>
                <Input
                  id="image"
                  value={course.image || ""}
                  onChange={(e) => setCourse({ ...course, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Videos */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Видео уроки</CardTitle>
              <Button type="button" onClick={addVideo} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Добавить видео
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {course.videos?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Пока нет видео уроков</p>
                <Button type="button" onClick={addVideo} variant="outline" className="mt-4 bg-transparent">
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить первое видео
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {course.videos?.map((video, index) => (
                  <Card key={video.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="font-medium">Урок {index + 1}</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeVideo(video.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Название урока</Label>
                          <Input
                            value={video.title}
                            onChange={(e) => updateVideo(video.id, "title", e.target.value)}
                            placeholder="Название урока"
                            required
                          />
                        </div>

                        <div>
                          <Label>Длительность (минуты)</Label>
                          <Input
                            type="number"
                            value={Math.floor(video.duration / 60)}
                            onChange={(e) => updateVideo(video.id, "duration", Number.parseInt(e.target.value) * 60)}
                            placeholder="30"
                            min="1"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <Label>Описание урока</Label>
                          <Textarea
                            value={video.description}
                            onChange={(e) => updateVideo(video.id, "description", e.target.value)}
                            placeholder="Краткое описание урока"
                            rows={2}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <Label>URL видео</Label>
                          <Input
                            value={video.videoUrl}
                            onChange={(e) => updateVideo(video.id, "videoUrl", e.target.value)}
                            placeholder="https://example.com/video.mp4"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={saving} className="min-w-32">
            {saving ? "Сохранение..." : "Сохранить курс"}
          </Button>
          <Link href="/admin">
            <Button type="button" variant="outline">
              Отмена
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
