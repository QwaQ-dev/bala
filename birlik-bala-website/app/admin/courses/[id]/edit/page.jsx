
"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function EditCoursePage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [course, setCourse] = useState({
    title: "",
    description: "",
    cost: "",
    img: null,
    videos: [], // { id, file, name (for existing videos), url (for existing videos) }
  });

  const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
  const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100 MB

  // Fetch course data on mount
  useEffect(() => {
    console.log("[EditCoursePage] Course ID from useParams:", id);
    if (!id) {
      toast.error("ID курса отсутствует", {
        action: {
          label: "Вернуться в админку",
          onClick: () => router.push("/admin"),
        },
      });
      setTimeout(() => router.push("/admin"), 3000);
      setFetching(false);
      return;
    }

    const fetchCourse = async () => {
      setFetching(true);
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("access_token="))
          ?.split("=")[1];
        console.log("[EditCoursePage] Access token:", token || "none");

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout
        const response = await fetch(`/api/admin/courses/${id}`, {
          method: "GET",
          credentials: "include",
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        console.log("[EditCoursePage] Fetch course response status:", response.status);
        const contentType = response.headers.get("content-type");
        let data;
        const responseText = await response.text();
        console.log("[EditCoursePage] Fetch course response body:", responseText);

        if (contentType && contentType.includes("application/json")) {
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error("[EditCoursePage] JSON parse error:", parseError.message, responseText);
            toast.error(`Ошибка загрузки курса: Неверный формат ответа`, {
              action: {
                label: "Вернуться в админку",
                onClick: () => router.push("/admin"),
              },
            });
            setTimeout(() => router.push("/admin"), 3000);
            setFetching(false);
            return;
          }
        } else {
          console.error("[EditCoursePage] Non-JSON response:", responseText);
          toast.error(`Ошибка загрузки курса: Неверный формат ответа от сервера`, {
            action: {
              label: "Вернуться в админку",
              onClick: () => router.push("/admin"),
            },
          });
          setTimeout(() => router.push("/admin"), 3000);
          setFetching(false);
          return;
        }

        if (!response.ok) {
          console.error("[EditCoursePage] Failed to fetch course:", response.status, data);
          const errorMessage = response.status === 404 ? "Курс не найден" : `Ошибка загрузки курса: ${data.error || responseText}`;
          toast.error(errorMessage, {
            action: {
              label: "Вернуться в админку",
              onClick: () => router.push("/admin"),
            },
          });
          setTimeout(() => router.push("/admin"), 3000);
          setFetching(false);
          return;
        }

        setCourse({
          title: data.title || "",
          description: data.description || "",
          cost: data.cost ? data.cost.toString() : "",
          img: null, // Image will be re-uploaded if changed
          videos: data.videos
            ? data.videos.map((video) => ({
                id: video.id,
                name: video.name,
                url: video.url,
                file: null,
              }))
            : [],
        });
      } catch (error) {
        console.error("[EditCoursePage] Error fetching course:", error.message);
        toast.error(`Ошибка: ${error.message || "Не удалось загрузить курс"}`, {
          action: {
            label: "Вернуться в админку",
            onClick: () => router.push("/admin"),
          },
        });
        setTimeout(() => router.push("/admin"), 3000);
      } finally {
        setFetching(false);
      }
    };

    fetchCourse();
  }, [id, router]);

  const addVideo = () => {
    setCourse({
      ...course,
      videos: [...course.videos, { id: Date.now().toString(), file: null, name: null, url: null }],
    });
  };

  const removeVideo = async (videoId) => {
    const video = course.videos.find((v) => v.id === videoId);
    if (video.url && !confirm("Вы уверены, что хотите удалить видео? Это действие нельзя отменить.")) {
      return;
    }

    try {
      if (video.url) {
        // Delete video from backend if it exists
        const formData = new FormData();
        formData.append("course_id", id);
        formData.append("video_id", videoId);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout
        const response = await fetch(`/api/admin/courses/remove-video`, {
          method: "POST",
          credentials: "include",
          body: formData,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        console.log("[EditCoursePage] Delete video response status:", response.status);
        const responseText = await response.text();
        let result;
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          console.error("[EditCoursePage] Delete video JSON parse error:", parseError.message, responseText);
          throw new Error(`Неверный формат ответа: ${responseText.slice(0, 100)}...`);
        }

        if (!response.ok) {
          console.error("[EditCoursePage] Failed to delete video:", response.status, result);
          toast.error(`Ошибка при удалении видео: ${result.error || result.message || "Неизвестная ошибка"}`);
          return;
        }
      }

      // Remove video from state
      setCourse({
        ...course,
        videos: course.videos.filter((video) => video.id !== videoId),
      });
      toast.success("Видео удалено");
    } catch (error) {
      console.error("[EditCoursePage] Error deleting video:", error.message);
      toast.error(`Ошибка при удалении видео: ${error.message || "Не удалось выполнить запрос"}`);
    }
  };

  const handleFileChange = (videoId, file) => {
    if (file && file.size > MAX_VIDEO_SIZE) {
      toast.error(`Файл видео не должен превышать ${MAX_VIDEO_SIZE / 1024 / 1024} МБ`);
      return;
    }
    setCourse({
      ...course,
      videos: course.videos.map((video) =>
        video.id === videoId ? { ...video, file, name: file ? file.name : video.name } : video
      ),
    });
  };

  const handleImageChange = (file) => {
    if (file && file.size > MAX_IMAGE_SIZE) {
      toast.error(`Файл изображения не должен превышать ${MAX_IMAGE_SIZE / 1024 / 1024} МБ`);
      return;
    }
    setCourse({ ...course, img: file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!course.title.trim()) {
      toast.error("Введите название курса");
      return;
    }
    if (!course.description.trim()) {
      toast.error("Введите описание курса");
      return;
    }
    if (course.videos.some((video) => video.file && !video.name)) {
      toast.error("Выберите файлы для всех новых видео");
      return;
    }
    if (!id) {
      toast.error("ID курса отсутствует");
      return;
    }

    setLoading(true);
    try {
      // Update course
      const formData = new FormData();
      console.log("[EditCoursePage] Sending course_id:", id);
      formData.append("id", id); // Changed from course_id to id to match backend expectation
      formData.append("title", course.title);
      formData.append("description", course.description);
      if (course.cost) formData.append("cost", course.cost);
      if (course.img) formData.append("img", course.img);

      console.log("[EditCoursePage] FormData entries:", [...formData.entries()]);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout
      const updateResponse = await fetch(`/api/admin/courses/update`, {
        method: "PUT",
        credentials: "include",
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      console.log("[EditCoursePage] Update course response status:", updateResponse.status);
      const contentType = updateResponse.headers.get("content-type");
      let updateResult;
      const responseText = await updateResponse.text();
      console.log("[EditCoursePage] Update course response body:", responseText);

      if (contentType && contentType.includes("application/json")) {
        try {
          updateResult = JSON.parse(responseText);
        } catch (parseError) {
          console.error("[EditCoursePage] JSON parse error:", parseError.message, responseText);
          throw new Error(`Неверный формат ответа: ${responseText.slice(0, 100)}...`);
        }
      } else {
        console.error("[EditCoursePage] Non-JSON response:", responseText);
        throw new Error(`Неверный формат ответа: ${responseText.slice(0, 100)}...`);
      }

      if (!updateResponse.ok) {
        console.error("[EditCoursePage] Failed to update course:", updateResponse.status, updateResult);
        toast.error(`Ошибка при обновлении курса: ${updateResult.error || updateResult.message || "Неизвестная ошибка"}`);
        setLoading(false);
        return;
      }

      // Upload new or replacement videos if any
      const newVideos = course.videos.filter((video) => video.file);
      if (newVideos.length > 0) {
        const videoFormData = new FormData();
        videoFormData.append("course_id", id.toString());
        newVideos.forEach((video, index) => {
          videoFormData.append(`videos[${index}]`, video.file);
        });
        const videoController = new AbortController();
        const videoTimeoutId = setTimeout(() => videoController.abort(), 60000); // 60-second timeout
        const videoResponse = await fetch("/api/admin/courses/add-video", {
          method: "POST",
          credentials: "include",
          body: videoFormData,
          signal: videoController.signal,
        });
        clearTimeout(videoTimeoutId);

        console.log("[EditCoursePage] Video upload response status:", videoResponse.status);
        const videoContentType = videoResponse.headers.get("content-type");
        let videoResult;
        const videoResponseText = await videoResponse.text();
        try {
          videoResult = JSON.parse(videoResponseText);
        } catch (parseError) {
          console.error("[EditCoursePage] Video JSON parse error:", parseError.message, videoResponseText);
          throw new Error(`Неверный формат ответа: ${videoResponseText.slice(0, 100)}...`);
        }

        if (!videoResponse.ok) {
          console.error("[EditCoursePage] Failed to upload videos:", videoResponse.status, videoResult);
          toast.warning(`Курс обновлён, но видео не загружены: ${videoResult.error || videoResult.message || "Неизвестная ошибка"}`);
        }
      }

      toast.success("Курс успешно обновлён");
      router.push("/admin");
    } catch (error) {
      console.error("[EditCoursePage] Error:", error.message);
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
      course.videos.some((video) => video.file || video.name)
    ) {
      if (confirm("Вы уверены, что хотите отменить редактирование курса? Все изменения будут потеряны.")) {
        router.push("/admin");
      }
    } else {
      router.push("/admin");
    }
  };

  if (fetching) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
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
          <p className="text-gray-600">Обновите информацию о курсе и видео уроки</p>
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
                      <div>
                        <Label>Файл видео</Label>
                        <Input
                          type="file"
                          accept="video/mp4"
                          onChange={(e) => handleFileChange(video.id, e.target.files[0])}
                        />
                        {video.file ? (
                          <p className="text-sm text-gray-500 mt-1">{video.file.name} ({(video.file.size / 1024 / 1024).toFixed(2)} МБ)</p>
                        ) : video.name && video.url ? (
                          <p className="text-sm text-gray-500 mt-1">
                            Текущее видео: <a href={video.url} target="_blank" className="text-blue-600 hover:underline">{video.name}</a>
                          </p>
                        ) : null}
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
          <Button type="submit" disabled={loading || fetching} className="min-w-32">
            {loading ? "Обновление..." : "Обновить курс"}
          </Button>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Отменить
          </Button>
        </div>
      </form>
    </div>
  );
}
