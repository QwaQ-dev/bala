"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Download, Calendar } from "lucide-react";
import { use } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function CoursePage({ params }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;

  const [course, setCourse] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allVideosWatched, setAllVideosWatched] = useState(false);
  const [studentName, setStudentName] = useState("");
  const videoRefs = useRef([]);

  useEffect(() => {
    if (!slug || slug === "undefined") {
      setError("Неверный slug курса");
      setLoading(false);
      return;
    }
    loadCourse();
  }, [slug]);

  const loadCourse = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("access_token="))
        ?.split("=")[1];

      const response = await fetch(`/api/courses/${slug}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      if (!data.id) throw new Error("Invalid course data format");

      setCourse(data);
      if (Array.isArray(data.videos) && data.videos.length > 0) {
        setCurrentVideo(data.videos[0]);
      }
      videoRefs.current = data.videos.map(() => ({ ended: false }));
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const selectVideo = (video) => {
    const index = course.videos.findIndex((v) => v.id === video.id);
    setCurrentVideo(video);
    if (videoRefs.current[index]?.ended) {
      setAllVideosWatched(true);
    }
  };

  const handleVideoEnd = (index) => {
    videoRefs.current[index].ended = true;
    setAllVideosWatched(videoRefs.current.every((ref) => ref.ended));
  };

  const downloadDiploma = async () => {
    if (!studentName.trim()) return alert("Пожалуйста, введите имя студента");
    if (!course.diploma_path) return alert("Шаблон диплома не доступен.");

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const diplomaImg = new Image();
      diplomaImg.crossOrigin = "anonymous";
      diplomaImg.src = `https://api.birlikbala.kz${course.diploma_path}`;
      await new Promise((resolve, reject) => {
        diplomaImg.onload = resolve;
        diplomaImg.onerror = reject;
      });

      canvas.width = course.diploma_natural_width || diplomaImg.width;
      canvas.height = course.diploma_natural_height || diplomaImg.height;
      ctx.drawImage(diplomaImg, 0, 0);

      const verticalOffset = 20;
      ctx.font = "bold 48px Arial";
      ctx.fillStyle = "black";
      ctx.fillText(studentName, course.diploma_x, course.diploma_y + verticalOffset);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "white";
      ctx.strokeText(studentName, course.diploma_x, course.diploma_y + verticalOffset);

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `diploma_${studentName}.png`;
      link.click();
    } catch (error) {
      alert("Ошибка при создании диплома: " + error.message);
    }
  };

  // ✅ Открыть файл в новой вкладке
  const openFileInNewTab = (filePath) => {
    const url = `https://api.birlikbala.kz${filePath}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (loading) return <p className="p-8">Загрузка курса...</p>;
  if (error || !course) return <p className="p-8 text-red-600">{error || "Курс не найден"}</p>;

  return (
    <div className="container mx-auto px-4 py-8 mt-10">
      <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
      <p className="text-gray-600 mb-4">{course.description}</p>

      {/* Diploma Section */}
      {course.diploma_x && course.diploma_y && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Диплом</CardTitle>
          </CardHeader>
          <CardContent>
            <Label>Введите имя студента</Label>
            <Input
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Введите имя"
            />
            <Button onClick={downloadDiploma} disabled={!allVideosWatched} className="mt-4">
              <Download className="w-4 h-4 mr-2" />
              {allVideosWatched ? "Скачать диплом" : "Просмотрите все видео"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Основной блок */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Видео */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              {currentVideo ? (
                <div>
                  <div className="aspect-video bg-black rounded-t-lg overflow-hidden">
                    <video
                      src={`https://api.birlikbala.kz${currentVideo.path}`}
                      controls
                      className="w-full h-full object-contain"
                      onEnded={() =>
                        handleVideoEnd(course.videos.findIndex((v) => v.id === currentVideo.id))
                      }
                    />
                  </div>
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-2">{currentVideo.title}</h2>
                    {currentVideo.description && (
                      <p className="text-gray-600 mb-4">{currentVideo.description}</p>
                    )}

                    {/* ✅ Открыть прикрепленный файл в новой вкладке */}
                    {currentVideo.file && (
                      <div className="mt-4">
                        <Label>Прикреплённый файл:</Label>
                        <Button
                          variant="link"
                          className="text-blue-600 hover:underline flex items-center gap-2 p-0"
                          onClick={() => openFileInNewTab(currentVideo.file)}
                        >
                          <Download className="w-4 h-4" />
                          Открыть файл
                        </Button>
                      </div>
                    )}
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

        {/* Уроки + вебинар */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Уроки курса</h3>

          {/* Уроки */}
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
                    <span className="text-sm font-medium text-gray-500">Урок {index + 1}</span>
                    <CardTitle className="text-sm leading-tight">{video.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              {video.description && (
                <CardContent className="pt-0">
                  <CardDescription className="text-xs mb-2">{video.description}</CardDescription>
                </CardContent>
              )}
            </Card>
          ))}

          {/* Вебинар */}
          {course.webinars && (
            <Card className="cursor-pointer transition-all hover:shadow-md">
              <CardHeader className="pb-2 flex items-center justify-between">
                <CardTitle className="text-sm leading-tight">Вебинар</CardTitle>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="w-4 h-4" />
                  {course.webinars.date
                    ? new Date(course.webinars.date).toLocaleString("ru-RU", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Дата не указана"}
                </div>
              </CardHeader>
              <CardContent>
                <a
                  href={course.webinars.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 font-medium hover:underline flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Перейти к вебинару
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
