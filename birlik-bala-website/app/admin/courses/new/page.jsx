"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import Link from "next/link"

export default function NewCoursePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [course, setCourse] = useState({
    title: "",
    description: "",
    price: "",
    image: "",
    videos: [],
  })

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

    if (!course.title.trim()) {
      alert("Введите название курса")
      return
    }

    if (!course.description.trim()) {
      alert("Введите описание курса")
      return
    }

    if (course.videos.length === 0) {
      alert("Добавьте хотя бы одно видео")
      return
    }

    // Проверяем что все видео заполнены
    const emptyVideos = course.videos.filter((video) => !video.title.trim() || !video.description.trim())
    if (emptyVideos.length > 0) {
      alert("Заполните все поля для видео уроков")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/admin/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(course),
      })

      if (response.ok) {
        router.push("/admin")
      } else {
        alert("Ошибка при создании курса")
      }
    } catch (error) {
      console.error("Failed to create course:", error)
      alert("Ошибка при создании курса")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (course.title || course.description || course.videos.length > 0) {
      if (confirm("Вы уверены, что хотите отменить создание курса? Все данные будут потеряны.")) {
        router.push("/admin")
      }
    } else {
      router.push("/admin")
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Создать новый курс</h1>
          <p className="text-gray-600">Заполните информацию о курсе и добавьте видео уроки</p>
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
              <Label htmlFor="title">Название курса *</Label>
              <Input
                id="title"
                value={course.title}
                onChange={(e) => setCourse({ ...course, title: e.target.value })}
                placeholder="Введите название курса"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Описание *</Label>
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
                <Label htmlFor="price">Цена</Label>
                <Input
                    id="price"
                    value={course.price}
                    onChange={(e) => setCourse({ ...course, price: e.target.value })}
                    placeholder="10,000 (kzt)"
                    />
              </div>

              <div>
                <Label htmlFor="image">URL изображения</Label>
                <Input
                  id="image"
                  value={course.image}
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
              <CardTitle>Видео уроки *</CardTitle>
              <Button type="button" onClick={addVideo} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Добавить видео
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {course.videos.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                <p className="mb-4">Добавьте видео уроки для курса</p>
                <Button type="button" onClick={addVideo} variant="outline" className="bg-transparent">
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить первое видео
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {course.videos.map((video, index) => (
                  <Card key={video.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="font-medium text-blue-600">Урок {index + 1}</h4>
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
                          <Label>Название урока *</Label>
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
                            value={video.duration / 60 || ""}
                            onChange={(e) =>
                              updateVideo(video.id, "duration", Number.parseInt(e.target.value || 0) * 60)
                            }
                            placeholder="30"
                            min="1"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <Label>Описание урока *</Label>
                          <Textarea
                            value={video.description}
                            onChange={(e) => updateVideo(video.id, "description", e.target.value)}
                            placeholder="Краткое описание урока"
                            rows={2}
                            required
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
          <Button type="submit" disabled={loading} className="min-w-32">
            {loading ? "Создание..." : "Создать курс"}
          </Button>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Отменить
          </Button>
        </div>
      </form>
    </div>
  )
}
