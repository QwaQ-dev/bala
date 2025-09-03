import { Button } from "@/components/ui/button";
import Action from "@/components/Action";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

// ISR - обновляем каждые 30 минут
export const revalidate = 1800;
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

async function getChecklists() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/checklist/get`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {

      return [];
    }

    let checklists = await res.json();


    if (checklists.checklists === null) {
      checklists = {};
    }


    return checklists.checklists.map((checklist) => ({
      id: checklist.id,
      title: checklist.title || "Без названия",
      description: checklist.description || "Описание отсутствует",
      forAge: checklist.forAge ? `${checklist.forAge} лет` : "Для всех возрастов",
      url: checklist.slug || "https://drive.google.com", // Fallback URL
      image: "/placeholder.svg?height=200&width=300", // Placeholder image
    }));
  } catch (error) {
    return [];
  }
}

export default async function ChecklistsPage() {
  const checklists = await getChecklists(); // Получаем чеклисты

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-6 sm:mb-8 md:mb-12 pt-12 sm:pt-16"> {/* Added top padding */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4">
            Чеклисты
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto">
            Полезные материалы для родителей и педагогов
          </p>
        </div>

        {/* Сетка чеклистов */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {checklists.map((checklist) => (
            <Card
              key={checklist.id}
              className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-32 sm:h-48 bg-gradient-to-br from-green-100 to-green-200 relative flex-shrink-0">
                <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
                  <span className="bg-white bg-opacity-90 text-gray-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                    {checklist.forAge}
                  </span>
                </div>
              </div>
              <CardContent className="flex flex-col flex-1 p-3 sm:p-4 md:p-6">
                <div className="mb-2 sm:mb-3 md:mb-4">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 line-clamp-2 leading-tight">
                    {checklist.title}
                  </h3>
                </div>
                <div className="mb-2 sm:mb-3 md:mb-4">
                  <p className="text-gray-600 text-sm sm:text-base line-clamp-3 leading-relaxed">
                    {checklist.description}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3 md:mb-6 flex-shrink-0">
                  <span>Чеклист</span>
                  <span>{checklist.forAge}</span>
                </div>
                <div className="mt-auto">
                  <Link href={checklist.url} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base">
                      Открыть чеклист
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {checklists.length === 0 && (
          <div className="text-center py-6 sm:py-8 md:py-12">
            <div className="text-gray-400 mb-2 sm:mb-3 md:mb-4">
              <div className="w-12 sm:w-16 h-12 sm:h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-xl sm:text-2xl">📋</span>
              </div>
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-medium text-gray-900 mb-1 sm:mb-2">
              Чеклисты не найдены
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">Попробуйте позже</p>
          </div>
        )}

        <Action />
      </div>
    </div>
  );
}