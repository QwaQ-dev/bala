import { Button } from "@/components/ui/button";
import Action from "@/components/Action";
import Link from "next/link";
import CoursesClient from "@/components/CoursesClient";
import { getUserData } from "@/app/api/user";

// Отключаем статическую генерацию
export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const userData = await getUserData();
  console.log("Server userData:", userData);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20">

        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Курсы
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Обучающие программы по развитию детей и АВА-терапии
          </p>
        </div>
        <CoursesClient userData={userData} />
        <Action />
      </div>
    </div>
  );
}