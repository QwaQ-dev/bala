"use client";
import { useState, useRef } from "react";
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [course, setCourse] = useState({
    title: "",
    description: "",
    cost: "",
    img: null,
    diploma: null,
    diploma_x: 100,
    diploma_y: 100,
    diploma_natural_width: 0,
    diploma_natural_height: 0,
    videos: [],
    webinar_link: "",
    webinar_date: "",
  });
  const imageRef = useRef(null);

  const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
  const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100 MB
  const MAX_DIPLOMA_SIZE = 10 * 1024 * 1024; // 10 MB
  const ALLOWED_VIDEO_TYPES = ["video/mp4"];
  const ALLOWED_EXTRA_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png", "application/zip"];

  const addVideo = () => {
    setCourse((prev) => ({
      ...prev,
      videos: [...prev.videos, { id: crypto.randomUUID(), file: null, name: null, title: "", extraFile: null }],
    }));
  };

  const removeVideo = (videoId) => {
    setCourse((prev) => ({
      ...prev,
      videos: prev.videos.filter((video) => video.id !== videoId),
    }));
  };

  const handleFileChange = (videoId, file) => {
    if (file) {
      if (file.size > MAX_VIDEO_SIZE) {
        toast.error(`Файл видео не должен превышать ${MAX_VIDEO_SIZE / 1024 / 1024} МБ`);
        return;
      }
      if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
        toast.error("Видео должно быть в формате MP4");
        return;
      }
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
      videos: prev.videos.map((video) => (video.id === videoId ? { ...video, title } : video)),
    }));
  };

  const handleExtraFileChange = (videoId, file) => {
    if (file) {
      if (file.size > MAX_VIDEO_SIZE) {
        toast.error(`Дополнительный файл не должен превышать ${MAX_VIDEO_SIZE / 1024 / 1024} МБ`);
        return;
      }
      if (!ALLOWED_EXTRA_FILE_TYPES.includes(file.type)) {
        toast.error("Дополнительный файл должен быть PDF, JPEG, PNG или ZIP");
        return;
      }
    }
    setCourse((prev) => ({
      ...prev,
      videos: prev.videos.map((video) => (video.id === videoId ? { ...video, extraFile: file } : video)),
    }));
  };

  const handleImageChange = (file) => {
    if (file && file.size > MAX_IMAGE_SIZE) {
      toast.error(`Файл изображения не должен превышать ${MAX_IMAGE_SIZE / 1024 / 1024} МБ`);
      return;
    }
    setCourse((prev) => ({ ...prev, img: file }));
  };

  const handleDiplomaChange = (file) => {
    if (file && file.size > MAX_DIPLOMA_SIZE) {
      toast.error(`Файл диплома не должен превышать ${MAX_DIPLOMA_SIZE / 1024 / 1024} МБ`);
      return;
    }
    setCourse((prev) => {
      const newState = { ...prev, diploma: file };
      if (file) {
        const img = new Image();
        img.onload = () => {
          setCourse((prevState) => ({
            ...prevState,
            diploma_natural_width: img.naturalWidth,
            diploma_natural_height: img.naturalHeight,
          }));
        };
        img.src = URL.createObjectURL(file);
      } else {
        setCourse((prevState) => ({
          ...prevState,
          diploma_natural_width: 0,
          diploma_natural_height: 0,
        }));
      }
      return newState;
    });
  };

  const handleImageClick = (e) => {
    if (!imageRef.current || !course.diploma) return;
    const rect = imageRef.current.getBoundingClientRect();
    const naturalWidth = course.diploma_natural_width;
    const naturalHeight = course.diploma_natural_height;
    
    // Calculate scale factors based on displayed vs natural dimensions
    const scaleX = naturalWidth / rect.width;
    const scaleY = naturalHeight / rect.height;
    
    // Get click coordinates relative to the image
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Scale coordinates to match natural dimensions
    const scaledX = Math.round(x * scaleX);
    const scaledY = Math.round(y * scaleY);
    
    // Ensure coordinates are within image bounds
    const boundedX = Math.max(0, Math.min(scaledX, naturalWidth));
    const boundedY = Math.max(0, Math.min(scaledY, naturalHeight));

    setCourse((prev) => ({
      ...prev,
      diploma_x: boundedX,
      diploma_y: boundedY,
    }));
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
    if ((course.webinar_link.trim() || course.webinar_date) && (!course.webinar_link.trim() || !course.webinar_date)) {
      toast.error("У вебинара должны быть указаны и ссылка, и дата, либо оба поля пусты");
      return;
    }

    // Format webinar_date to RFC3339 with +09:00 timezone
    let formattedWebinarDate = course.webinar_date;
    if (course.webinar_date) {
      const date = new Date(course.webinar_date);
      if (isNaN(date.getTime())) {
        toast.error("Неверный формат даты вебинара");
        return;
      }
      formattedWebinarDate = date.toISOString().replace(/\.\d{3}Z$/, "") + "+09:00";
    }

    if (course.diploma && course.diploma.size === 0) {
      toast.error("Выберите корректный файл для диплома");
      return;
    }

    setLoading(true);
    setUploadProgress(0);
    try {
      // Create course
      const formData = new FormData();
      formData.append("title", course.title);
      formData.append("description", course.description);
      if (course.cost) formData.append("cost", course.cost);
      if (course.img) formData.append("img", course.img);
      if (course.diploma) {
        formData.append("diploma", course.diploma);
      }
      formData.append("diploma_x", course.diploma_x.toString());
      formData.append("diploma_y", course.diploma_y.toString());
      formData.append("diploma_natural_width", course.diploma_natural_width.toString());
      formData.append("diploma_natural_height", course.diploma_natural_height.toString());
      if (course.webinar_link.trim()) formData.append("webinar_link", course.webinar_link);
      if (formattedWebinarDate) formData.append("webinar_date", formattedWebinarDate);

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
        return;
      }

      const courseId = createResult.course_id || createResult.id;
      if (!courseId && course.videos.length > 0) {
        toast.warning("Курс создан, но видео не загружены: ID курса не возвращён сервером");
        router.push("/admin");
        return;
      }

      // Upload videos
      if (course.videos.length > 0 && courseId) {
        const videoFormData = new FormData();
        videoFormData.append("course_id", courseId.toString());

        course.videos.forEach((video, index) => {
          if (video.file) {
            videoFormData.append(`video[${index}]`, video.file);
            videoFormData.append(`title[${index}]`, video.title);
            if (video.extraFile && video.extraFile.size > 0) {
              videoFormData.append(`extra_file[${index}]`, video.extraFile);

            } else {
              videoFormData.append(`extra_file[${index}]`, "");
            }
          }
        });

        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percent);

          }
        };

        xhr.open("POST", "/api/admin/courses/add-video", true);
        xhr.withCredentials = true;
        xhr.setRequestHeader("Accept", "application/json");

        xhr.onreadystatechange = async () => {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status >= 200 && xhr.status < 300) {
              let videoResult;
              try {
                videoResult = JSON.parse(xhr.responseText);

                toast.success("Все видео и дополнительные файлы успешно загружены");
              } catch (parseError) {

                toast.error(`Неверный формат ответа для видео: ${xhr.responseText.slice(0, 100)}...`);
                return;
              }
            } else {
              let videoResult;
              try {
                videoResult = JSON.parse(xhr.responseText);
              } catch (parseError) {

                toast.error(`Ошибка загрузки видео: Неверный формат ответа`);
                return;
              }

              toast.warning(`Видео или дополнительные файлы не загружены: ${videoResult.error || videoResult.message || "Неизвестная ошибка"}`);
            }
          }
        };

        xhr.send(videoFormData);
      }

      toast.success("Курс успешно создан");
      router.push("/admin");
    } catch (error) {

      toast.error(`Ошибка: ${error.message || "Не удалось выполнить запрос"}`);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleCancel = () => {
    if (
      course.title ||
      course.description ||
      course.cost ||
      course.img ||
      course.diploma ||
      course.videos.some((video) => video.file || video.title || video.extraFile) ||
      course.webinar_link ||
      course.webinar_date
    ) {
      if (confirm("Вы уверены, что хотите отменить создание курса? Все изменения будут потеряны.")) {
        router.push("/admin");
      }
    } else {
      router.push("/admin");
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 pt-20">
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
        <Link href="/admin">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
        </Link>
        <div className="text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Создать новый курс</h1>
          <p className="text-gray-600 text-base sm:text-lg">Добавьте информацию о курсе, видео уроки, вебинар и диплом</p>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="cost">Цена (KZT)</Label>
                <Input
                  id="cost"
                  type="number"
                  value={course.cost}
                  onChange={(e) => setCourse({ ...course, cost: e.target.value })}
                  placeholder="10000"
                  min="0"
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
                  <p className="text-sm text-gray-500 mt-1">
                    {course.img.name} ({(course.img.size / 1024 / 1024).toFixed(2)} МБ)
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="diploma">Шаблон диплома</Label>
                <Input
                  id="diploma"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleDiplomaChange(e.target.files[0])}
                />
                {course.diploma && (
                  <p className="text-sm text-gray-500 mt-1">
                    {course.diploma.name} ({(course.diploma.size / 1024 / 1024).toFixed(2)} МБ)
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="diploma_x">X-координата имени на дипломе</Label>
                <Input
                  id="diploma_x"
                  type="number"
                  value={course.diploma_x}
                  onChange={(e) => setCourse({ ...course, diploma_x: parseInt(e.target.value) || 100 })}
                  placeholder="100"
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="diploma_y">Y-координата имени на дипломе</Label>
                <Input
                  id="diploma_y"
                  type="number"
                  value={course.diploma_y}
                  onChange={(e) => setCourse({ ...course, diploma_y: parseInt(e.target.value) || 100 })}
                  placeholder="100"
                  min="0"
                />
              </div>
            </div>
            {course.diploma && (
              <div className="mt-4">
                <Label>Выберите позицию имени на дипломе</Label>
                <div style={{ position: "relative", display: "inline-block" }}>
                  <img
                    ref={imageRef}
                    src={course.diploma ? URL.createObjectURL(course.diploma) : ""}
                    alt="Diploma Template"
                    style={{ maxWidth: "100%", height: "auto", cursor: "crosshair" }}
                    onClick={handleImageClick}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: `${course.diploma_x / (course.diploma_natural_width / imageRef.current?.width || 1)}px`,
                      top: `${course.diploma_y / (course.diploma_natural_height / imageRef.current?.height || 1)}px`,
                      width: "8px",
                      height: "8px",
                      backgroundColor: "red",
                      borderRadius: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Видео уроки */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <CardTitle>Видео уроки</CardTitle>
              <Button type="button" onClick={addVideo} variant="outline" size="sm" className="mt-2 sm:mt-0">
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
                      <div className="flex flex-col sm:flex-row items-start justify-between mb-4">
                        <h4 className="font-medium text-blue-600">Урок {index + 1}</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeVideo(video.id)}
                          className="mt-2 sm:mt-0 text-red-600 hover:text-red-700"
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
                            required={!video.file}
                          />
                          {video.file && (
                            <p className="text-sm text-gray-500 mt-1">
                              {video.file.name} ({(video.file.size / 1024 / 1024).toFixed(2)} МБ)
                            </p>
                          )}
                        </div>
                        <div>
                          <Label>Дополнительный файл</Label>
                          <Input
                            type="file"
                            accept="application/pdf,image/jpeg,image/png,application/zip"
                            onChange={(e) => handleExtraFileChange(video.id, e.target.files[0])}
                          />
                          {video.extraFile && (
                            <p className="text-sm text-gray-500 mt-1">
                              {video.extraFile.name} ({(video.extraFile.size / 1024 / 1024).toFixed(2)} МБ)
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            {loading && course.videos.length > 0 && (
              <div className="mt-4">
                <p>Загрузка видео: {uploadProgress}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Вебинар */}
        <Card>
          <CardHeader>
            <CardTitle>Вебинар</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="webinar_link">Ссылка на вебинар</Label>
              <Input
                id="webinar_link"
                type="url"
                value={course.webinar_link}
                onChange={(e) => setCourse({ ...course, webinar_link: e.target.value })}
                placeholder="Введите ссылку на вебинар"
              />
            </div>
            <div>
              <Label htmlFor="webinar_date">Дата и время вебинара</Label>
              <Input
                id="webinar_date"
                type="datetime-local"
                value={course.webinar_date}
                onChange={(e) => setCourse({ ...course, webinar_date: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Кнопки */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pb-8">
          <Button type="submit" disabled={loading} className="min-w-32 w-full sm:w-auto">
            {loading ? "Создание..." : "Создать курс"}
          </Button>
          <Button type="button" variant="outline" onClick={handleCancel} className="w-full sm:w-auto">
            Отменить
          </Button>
        </div>
      </form>
    </div>
  );
}