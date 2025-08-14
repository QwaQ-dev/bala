"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Play, Lock, CheckCircle, Clock } from "lucide-react"

async function fetchCourse(courseId) {
  //simulirujem, ubrat nah
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return {
    id: courseId,
    title: "Основы АБА развития",
    description: "Полный курс по изучению прикладного анализа поведения (АБА) с нуля",
    videos: [
      {
        id: "1",
        title: "Введение в АБА",
        description: "Основные принципы прикладного анализа поведения",
        duration: 1200,
        videoUrl: "/placeholder.svg?height=400&width=600",
        isWatched: false,
        isLocked: false,
      },
      {
        id: "2",
        title: "Позитивное подкрепление",
        description: "Как использовать подкрепление для формирования поведения",
        duration: 1800,
        videoUrl: "https://www.youtube.com/watch?v=R4ScLbxfdLI&ab_channel=%D0%A0%D0%B8%D1%81%D0%B0%D0%B7%D0%B0%D0%A2%D0%B2%D0%BE%D1%80%D1%87%D0%B5%D1%81%D1%82%D0%B2%D0%BE",
        isWatched: false,
        isLocked: true,
      },
      {
        id: "3",
        title: "Функциональный анализ",
        description: "Определение причин поведения",
        duration: 2400,
        videoUrl: "https://www.youtube.com/watch?v=R4ScLbxfdLI&ab_channel=%D0%A0%D0%B8%D1%81%D0%B0%D0%B7%D0%B0%D0%A2%D0%B2%D0%BE%D1%80%D1%87%D0%B5%D1%81%D1%82%D0%B2%D0%BE",
        isWatched: false,
        isLocked: true,
      },
      {
        id: "4",
        title: "Обучающие стратегии",
        description: "Методы преподавания с использованием АБА",
        duration: 3000,
        videoUrl: "https://www.youtube.com/watch?v=R4ScLbxfdLI&ab_channel=%D0%A0%D0%B8%D1%81%D0%B0%D0%B7%D0%B0%D0%A2%D0%B2%D0%BE%D1%80%D1%87%D0%B5%D1%81%D1%82%D0%B2%D0%BE",
        isWatched: false,
        isLocked: true,
      },
    ],
  }
}

export default function CoursePage({ params }) {
  const [course, setCourse] = useState(null)
  const [currentVideo, setCurrentVideo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [watchedVideos, setWatchedVideos] = useState(new Set())

  useEffect(() => {
    loadCourse()
  }, [params.id])

  const loadCourse = async () => {
    try {
      const courseData = await fetchCourse(params.id)

      const updatedVideos = courseData.videos.map((video, index) => ({
        ...video,
        isLocked: index > 0 && !watchedVideos.has(courseData.videos[index - 1].id),
        isWatched: watchedVideos.has(video.id),
      }))

      setCourse({ ...courseData, videos: updatedVideos })
      setCurrentVideo(updatedVideos[0])
    } catch (error) {
      console.error("Failed to load course:", error)
    } finally {
      setLoading(false)
    }
  }

  const markVideoAsWatched = async (videoId) => {
    if (!course) return

    const newWatchedVideos = new Set(watchedVideos)
    newWatchedVideos.add(videoId)
    setWatchedVideos(newWatchedVideos)

    const updatedVideos = course.videos.map((video, index) => {
      const isWatched = newWatchedVideos.has(video.id)
      const isLocked = index > 0 && !newWatchedVideos.has(course.videos[index - 1].id)

      return {
        ...video,
        isWatched,
        isLocked,
      }
    })

    setCourse({ ...course, videos: updatedVideos })

    try {
      await fetch(`/api/course/${course.id}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, completed: true }),
      })
    } catch (error) {
      console.error("Failed to save progress:", error)
    }
  }

  const selectVideo = (video) => {
    if (!video.isLocked) {
      setCurrentVideo(video)
    }
  }

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    return `${minutes} мин`
  }

  const getProgress = () => {
    if (!course) return 0
    return (watchedVideos.size / course.videos.length) * 100
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
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
          <p className="text-gray-600">Проверьте правильность ссылки</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
        <p className="text-gray-600 mb-4">{course.description}</p>

        <div className="flex items-center gap-4 mb-4">
          <Badge variant="secondary">
            {watchedVideos.size} из {course.videos.length} уроков пройдено
          </Badge>
          <span className="text-sm text-gray-500">Прогресс: {Math.round(getProgress())}%</span>
        </div>

        <Progress value={getProgress()} className="w-full max-w-md" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              {currentVideo ? (
                <div>
                  <div className="aspect-video bg-black rounded-t-lg flex items-center justify-center relative overflow-hidden">
                    <img
                      src={currentVideo.videoUrl || "/placeholder.svg"}
                      alt={currentVideo.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <Button
                        size="lg"
                        className="rounded-full w-16 h-16"
                        onClick={() => markVideoAsWatched(currentVideo.id)}
                      >
                        <Play className="w-6 h-6 ml-1" />
                      </Button>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-xl font-semibold">{currentVideo.title}</h2>
                      {currentVideo.isWatched && <CheckCircle className="w-5 h-5 text-green-500" />}
                    </div>
                    <p className="text-gray-600 mb-4">{currentVideo.description}</p>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {formatDuration(currentVideo.duration)}
                      </div>

                      {!currentVideo.isWatched && (
                        <Button onClick={() => markVideoAsWatched(currentVideo.id)} className="ml-auto">
                          Отметить как просмотренное
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="aspect-video flex items-center justify-center bg-gray-100">
                  <p className="text-gray-500">Выберите видео для просмотра</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Уроки курса</h3>

          {course.videos.map((video, index) => (
            <Card
              key={video.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                currentVideo?.id === video.id ? "ring-2 ring-blue-500" : ""
              } ${video.isLocked ? "opacity-60" : ""}`}
              onClick={() => selectVideo(video)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-500">Урок {index + 1}</span>
                      {video.isWatched && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {video.isLocked && <Lock className="w-4 h-4 text-gray-400" />}
                    </div>
                    <CardTitle className="text-sm leading-tight">{video.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <CardDescription className="text-xs mb-2">{video.description}</CardDescription>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {formatDuration(video.duration)}
                  </div>

                  {video.isLocked ? (
                    <Badge variant="secondary" className="text-xs">
                      Заблокировано
                    </Badge>
                  ) : video.isWatched ? (
                    <Badge variant="default" className="text-xs bg-green-500">
                      Просмотрено
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Доступно
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
