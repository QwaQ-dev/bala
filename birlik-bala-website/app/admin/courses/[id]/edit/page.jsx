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
    videos: [], // { id, file, name, url }
  });

  const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
  const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100 MB

  useEffect(() => {
    if (!id) {
      toast.error("ID курса отсутствует", { action: { label: "Вернуться в админку", onClick: () => router.push("/admin") } });
      setTimeout(() => router.push("/admin"), 3000);
      setFetching(false);
      return;
    }

    const fetchCourse = async () => {
      setFetching(true);
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const response = await fetch(`/api/admin/courses/${id}`, { method: "GET", credentials: "include", signal: controller.signal });
        clearTimeout(timeoutId);

        const responseText = await response.json();
        const data = responseText.course;

        if (!response.ok) {
          const errorMessage = response.status === 404 ? "Курс не найден" : `Ошибка загрузки курса: ${data?.error || "неизвестная ошибка"}`;
          toast.error(errorMessage, { action: { label: "Вернуться в админку", onClick: () => router.push("/admin") } });
          setTimeout(() => router.push("/admin"), 3000);
          setFetching(false);
          return;
        }

        setCourse({
          title: data.title || "",
          description: data.description || "",
          cost: data.cost ? data.cost.toString() : "",
          img: null,
          videos: data.videos
            ? data.videos.map((video) => ({
                id: video.id,
                name: video.title || `Видео ${video.id}`,
                url: video.path || null,
                file: null,
              }))
            : [],
        });
      } catch (error) {

        toast.error(`Ошибка: ${error.message || "Не удалось загрузить курс"}`, { action: { label: "Вернуться в админку", onClick: () => router.push("/admin") } });
        setTimeout(() => router.push("/admin"), 3000);
      } finally {
        setFetching(false);
      }
    };

    fetchCourse();
  }, [id, router]);

  const addVideo = () => {
    setCourse({ ...course, videos: [...course.videos, { id: Date.now().toString(), file: null, name: "", url: null }] });
  };

  const removeVideo = async (videoId) => {
    const video = course.videos.find((v) => v.id === videoId);
    if (video.url && !confirm("Вы уверены, что хотите удалить видео?")) return;

    try {
      if (video.url) {
        const formData = new FormData();
        formData.append("course_id", id);
        formData.append("video_id", videoId);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const response = await fetch(`/api/admin/courses/remove-video`, { method: "POST", credentials: "include", body: formData, signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
          const result = await response.json();
          toast.error(`Ошибка при удалении видео: ${result.error || result.message}`);
          return;
        }
      }

      setCourse({ ...course, videos: course.videos.filter((v) => v.id !== videoId) });
      toast.success("Видео удалено");
    } catch (error) {

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
      videos: course.videos.map((v) => (v.id === videoId ? { ...v, file, name: file ? file.name : v.name } : v)),
    });
  };

  const handleVideoNameChange = (videoId, name) => {
    setCourse({ ...course, videos: course.videos.map((v) => (v.id === videoId ? { ...v, name } : v)) });
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
    if (!course.title.trim()) return toast.error("Введите название курса");
    if (!course.description.trim()) return toast.error("Введите описание курса");
    if (!id) return toast.error("ID курса отсутствует");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("id", id);
      formData.append("title", course.title);
      formData.append("description", course.description);
      if (course.cost) formData.append("cost", course.cost);
      if (course.img) formData.append("img", course.img);

      const updateResponse = await fetch(`/api/admin/courses/update`, { method: "PUT", credentials: "include", body: formData });
      const updateResult = await updateResponse.json();
      if (!updateResponse.ok) {
        toast.error(`Ошибка при обновлении курса: ${updateResult.error || updateResult.message}`);
        setLoading(false);
        return;
      }

      const newVideos = course.videos.filter((v) => v.file);
      if (newVideos.length > 0) {
        const videoFormData = new FormData();
        videoFormData.append("course_id", id);
        newVideos.forEach((v, index) => {
          videoFormData.append(`videos[${index}]`, v.file);
          videoFormData.append(`titles[${index}]`, v.name);
        });

        const videoResponse = await fetch("/api/admin/courses/add-video", { method: "POST", credentials: "include", body: videoFormData });
        if (!videoResponse.ok) {
          const videoResult = await videoResponse.json();
          toast.warning(`Курс обновлён, но видео не загружены: ${videoResult.error || videoResult.message}`);
        }
      }

      toast.success("Курс успешно обновлён");
      router.push("/admin");
    } catch (error) {

      toast.error(`Ошибка: ${error.message || "Не удалось выполнить запрос"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (course.title || course.description || course.cost || course.img || course.videos.some((v) => v.file || v.name)) {
      if (!confirm("Вы уверены, что хотите отменить редактирование курса?")) return;
    }
    router.push("/admin");
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
            <ArrowLeft className="w-4 h-4 mr-2" /> Назад
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Редактировать курс</h1>
          <p className="text-gray-600">Обновите информацию о курсе и видео уроки</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Название курса *</Label>
              <Input id="title" value={course.title} onChange={(e) => setCourse({ ...course, title: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="description">Описание *</Label>
              <Textarea id="description" value={course.description} onChange={(e) => setCourse({ ...course, description: e.target.value })} rows={4} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cost">Цена (KZT)</Label>
                <Input id="cost" type="number" value={course.cost} onChange={(e) => setCourse({ ...course, cost: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="img">Изображение</Label>
                <Input id="img" type="file" accept="image/*" onChange={(e) => handleImageChange(e.target.files[0])} />
                {course.img && <p className="text-sm text-gray-500 mt-1">{course.img.name}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-4">
          <Button type="submit" disabled={loading || fetching}>{loading ? "Обновление..." : "Обновить курс"}</Button>
          <Button type="button" variant="outline" onClick={handleCancel}>Отменить</Button>
        </div>
      </form>
    </div>
  );
}
