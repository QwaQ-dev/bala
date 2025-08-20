"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function NewCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState({
    title: "",
    description: "",
    cost: "",
    img: null,
    videos: [], // { id, file, name, title }
  });

  const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
  const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100 MB

  const addVideo = () => {
    setCourse((prev) => ({
      ...prev,
      videos: [...prev.videos, { id: crypto.randomUUID(), file: null, name: null, title: "" }],
    }));
  };

  const removeVideo = (videoId) => {
    setCourse((prev) => ({
      ...prev,
      videos: prev.videos.filter((video) => video.id !== videoId),
    }));
  };

  const handleFileChange = (videoId, file) => {
    if (file && file.size > MAX_VIDEO_SIZE) {
      toast.error(`Файл видео не должен превышать ${MAX_VIDEO_SIZE / 1024 / 1024} МБ`);
      return;
    }
    setCourse((prev) => ({
      ...prev,
      videos: prev.videos.map((video) =>
        video.id === videoId ? { ...video, file, name: file ? file.name : null } : video
      ),
    }));
  };

  const handleTitleChange = (videoId, title) => {
    setCourse((prev) => ({
      ...prev,
      videos: prev.videos.map((video) =>
        video.id === videoId ? { ...video, title } : video
      ),
    }));
  };

  const handleImageChange = (file) => {
    if (file && file.size > MAX_IMAGE_SIZE) {
      toast.error(`Файл изображения не должен превышать ${MAX_IMAGE_SIZE / 1024 / 1024} МБ`);
      return;
    }
    setCourse((prev) => ({ ...prev, img: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!course.title.trim()) {
      toast.error("Введите название курса");
      return;
    }
    if (!course.description.trim()) {
      toast.error("Введите описание курса");
      return;
    }
    if (course.videos.some((video) => !video.file || !video.title.trim())) {
      toast.error("У всех видео должны быть название и файл");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", course.title);
      formData.append("description", course.description);
      if (course.cost) formData.append("cost", course.cost);
      if (course.img) formData.append("img", course.img);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      const createResponse = await fetch("/api/admin/courses/create", {
        method: "POST",
        credentials: "include",
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const responseText = await createResponse.text();
      let createResult;
      try {
        createResult = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Неверный формат ответа: ${responseText.slice(0, 100)}...`);
      }

      if (!createResponse.ok) {
        toast.error(`Ошибка при создании курса: ${createResult.error || createResult.message || "Неизвестная ошибка"}`);
        setLoading(false);
        return;
      }

      const courseId = createResult.course_id || createResult.id;
      if (!courseId && course.videos.length > 0) {
        toast.warning("Курс создан, но видео не загружены: ID курса не возвращён сервером");
        router.push("/admin");
        return;
      }

      if (course.videos.length > 0 && courseId) {
        const videoFormData = new FormData();
        videoFormData.append("course_id", courseId);
        course.videos.forEach((video) => {
          videoFormData.append("videos", video.file);
        });
        course.videos.forEach((video) => {
          videoFormData.append("titles", video.title);
        });

        const videoController = new AbortController();
        const videoTimeoutId = setTimeout(() => videoController.abort(), 60000);
        const videoResponse = await fetch("/api/admin/courses/add-video", {
          method: "POST",
          credentials: "include",
          body: videoFormData,
          signal: videoController.signal,
        });
        clearTimeout(videoTimeoutId);

        const videoResponseText = await videoResponse.text();
        let videoResult;
        try {
          videoResult = JSON.parse(videoResponseText);
        } catch (parseError) {
          throw new Error(`Неверный формат ответа: ${videoResponseText.slice(0, 100)}...`);
        }

        if (!videoResponse.ok) {
          toast.warning(`Курс создан, но видео не загружены: ${videoResult.error || videoResult.message || "Неизвестная ошибка"}`);
        }
      }

      toast.success("Курс успешно создан");
      router.push("/admin");
    } catch (error) {
      toast.error(`Ошибка: ${error.message || "Не удалось выполнить запрос"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (
      course.title ||
      course.description ||
      course.cost ||
      course.img ||
      course.videos.some((video) => video.file || video.title)
    ) {
      if (confirm("Вы уверены, что хотите отменить создание курса? Все изменения будут потеряны.")) {
        router.push("/admin");
      }
    } else {
      router.push("/admin");
    }
  };

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
          <p className="text-gray-600">Добавьте информацию о курсе и видео уроки</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Основная информация */}
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
                <Label htmlFor="cost">Цена (KZT)</Label>
                <Input
                  id="cost"
                  type="number"
                  value={course.cost}
                  onChange={(e) => setCourse({ ...course, cost: e.target.value })}
                  placeholder="10000"
                />
              </div>
              <div>
                <Label htmlFor="img">Изображение</Label>
                <Input
                  id="img"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e.target.files[0])}
                />
                {course.img && (
                  <p className="text-sm text-gray-500 mt-1">{course.img.name} ({(course.img.size / 1024 / 1024).toFixed(2)} МБ)</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Видео уроки */}
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
                      <div className="space-y-2">
                        <div>
                          <Label>Название урока *</Label>
                          <Input
                            type="text"
                            value={video.title}
                            onChange={(e) => handleTitleChange(video.id, e.target.value)}
                            placeholder="Введите название урока"
                            required
                          />
                        </div>
                        <div>
                          <Label>Файл видео *</Label>
                          <Input
                            type="file"
                            accept="video/mp4"
                            onChange={(e) => handleFileChange(video.id, e.target.files[0])}
                            required
                          />
                          {video.file && (
                            <p className="text-sm text-gray-500 mt-1">{video.file.name} ({(video.file.size / 1024 / 1024).toFixed(2)} МБ)</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Кнопки */}
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
  );
}
