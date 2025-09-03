"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Play, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CoursesClient() {
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch("/api/courses", {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to fetch courses: ${res.status} - ${errorText}`);
        }
        const data = await res.json();
        if (!Array.isArray(data)) {
          throw new Error("Invalid data format received from server");
        }
        setCourses(data);
      } catch (err) {
        setError(err.message);
      }
    }
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((course) => {
    if (filter === "available") return course.has_access;
    if (filter === "unavailable") return !course.has_access;
    return true;
  });

  const handleCourseAction = (course) => {
  if (course.has_access) {
    router.push(`/courses/${course.id}`);
  } else {
    const phone = "77018409229"; // номер для WhatsApp
    const message = `Здравствуйте! Хочу приобрести курс "${course.title}".`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer"); // открываем в новой вкладке
  }
};


  return (
    <>
      <div className="flex justify-center mb-4 sm:mb-8">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 bg-white rounded-lg p-2 sm:p-3 shadow-sm">
          <Button
            variant={filter === "all" ? "default" : "ghost"}
            onClick={() => setFilter("all")}
            className={`w-full sm:w-auto ${filter === "all" ? "bg-blue-600 text-white" : ""}`}
          >
            Все курсы ({courses.length})
          </Button>
          <Button
            variant={filter === "available" ? "default" : "ghost"}
            onClick={() => setFilter("available")}
            className={`w-full sm:w-auto ${filter === "available" ? "bg-green-600 text-white" : ""}`}
          >
            Доступные ({courses.filter((c) => c.has_access).length})
          </Button>
          <Button
            variant={filter === "unavailable" ? "default" : "ghost"}
            onClick={() => setFilter("unavailable")}
            className={`w-full sm:w-auto ${filter === "unavailable" ? "bg-red-600 text-white" : ""}`}
          >
            Недоступные ({courses.filter((c) => !c.has_access).length})
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredCourses.map((course) => (
          <Card
            key={course.id}
            className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
          >
            <div className="relative h-32 sm:h-48 bg-gray-100 flex-shrink-0">
              {course.img && (
                <img
                  src={`http://localhost:8080${course.img}`}
                  alt={course.title}
                  className="object-cover w-full h-full"
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                {course.has_access ? (
                  <div className="w-12 sm:w-16 h-12 sm:h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-lg">
                    <Play className="w-4 sm:w-6 h-4 sm:h-6 text-green-600 ml-1" />
                  </div>
                ) : (
                  <div className="w-12 sm:w-16 h-12 sm:h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-lg">
                    <Lock className="w-4 sm:w-6 h-4 sm:h-6 text-red-600" />
                  </div>
                )}
              </div>

              <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
                <span
                  className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                    course.has_access ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {course.has_access ? "Доступен" : `${course.cost}₸`}
                </span>
              </div>
            </div>

            <CardContent className="flex flex-col flex-1 p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-2 leading-tight mb-2 sm:mb-3">
                {course.title}
              </h3>

              <p className="text-gray-600 text-sm sm:text-base line-clamp-3 leading-relaxed mb-4 sm:mb-6">
                {course.description}
              </p>

              <div className="mt-auto">
                <Button
                  onClick={() => handleCourseAction(course)}
                  className={`w-full flex items-center justify-center space-x-2 ${
                    course.has_access
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-red-600 hover:bg-red-700 text-white"
                  }`}
                >
                  {course.has_access ? (
                    <>
                      <Play className="w-3 sm:w-4 h-3 sm:h-4" />
                      <span className="text-sm sm:text-base">Начать курс</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 sm:w-4 h-3 sm:h-4" />
                      <span className="text-sm sm:text-base">Купить за {course.cost}₸</span>
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-6 sm:py-12">
          <div className="text-gray-400 mb-2 sm:mb-4">
            <Play className="w-12 sm:w-16 h-12 sm:h-16 mx-auto" />
          </div>
          <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-1 sm:mb-2">
            Курсы не найдены
          </h3>
          <p className="text-gray-600 text-sm sm:text-base">
            Попробуйте изменить фильтр или вернитесь позже
          </p>
        </div>
      )}
    </>
  );
}