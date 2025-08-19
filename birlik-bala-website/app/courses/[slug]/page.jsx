"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, AlertTriangle } from "lucide-react";

export default function CoursePage({ params }) {
  const [course, setCourse] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!params?.slug || params.slug === "undefined") {
      console.log("[CoursePage] Invalid params.slug:", params.slug);
      setError("Неверный slug курса");
      setLoading(false);
      return;
    }
    loadCourse();
  }, [params?.slug]);

  const loadCourse = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("access_token="))
        ?.split("=")[1];
      console.log("[CoursePage] Access token:", token || "none");

      const response = await fetch(`/api/courses/${params.slug}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const responseText = await response.text();
      if (!response.ok) throw new Error(`HTTP error: ${response.status} - ${responseText}`);

      const courseData = JSON.parse(responseText);
      if (!courseData.id || !Array.isArray(courseData.videos)) {
        throw new Error("Invalid course data format");
      }

      setCourse(courseData);
      setCurrentVideo(courseData.videos[0]);
    } catch (error) {
      console.error("[CoursePage] Failed to load course:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const selectVideo = (video) => setCurrentVideo(video);

  const formatDuration = (seconds) => `${Math.floor(seconds / 60)} мин`;

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
    );
  }

  if (error || !course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center p-4 bg-red-100 border border-red-400 text-red-700 rounded flex flex-col items-center gap-2">
          <AlertTriangle className="w-8 h-8" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{error || "Курс не найден"}</h1>
          <p className="text-gray-600 mb-4">Проверьте правильность ссылки или попробуйте снова</p>
          <Button variant="outline" onClick={loadCourse}>
            Повторить
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
        <p className="text-gray-600 mb-4">{course.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              {currentVideo ? (
                <div>
                  <div className="aspect-video bg-black rounded-t-lg overflow-hidden">
                    <video
                      src={currentVideo.videoUrl || "/placeholder.mp4"}
                      controls
                      className="w-full h-full object-contain"
                    >
                      <source src={currentVideo.videoUrl || "/placeholder.mp4"} type="video/mp4" />
                      Ваш браузер не поддерживает воспроизведение видео.
                    </video>
                  </div>
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-2">{currentVideo.title}</h2>
                    <p className="text-gray-600 mb-4">{currentVideo.description}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {formatDuration(currentVideo.duration)}
                      </div>
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
              }`}
              onClick={() => selectVideo(video)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-500">Урок {index + 1}</span>
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
