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
      console.log("[getChecklists] Ошибка:", res.status, await res.text());
      return [];
    }

    let checklists = await res.json();

    console.log(checklists.checklists)
    if (checklists.checklists === null){
      checklists = {}
    }
    console.log("[getChecklists] Checklists:", checklists);

    return checklists.checklists.map((checklist) => ({
      id: checklist.id,
      title: checklist.title || "Без названия",
      description: checklist.description || "Описание отсутствует",
      forAge: checklist.forAge ? `${checklist.forAge} лет` : "Для всех возрастов",
      url: checklist.slug || "https://drive.google.com", // Fallback URL
      image: "/placeholder.svg?height=200&width=300", // Placeholder image
    }));
  } catch (error) {
    console.log("[getChecklists] Ошибка:", error.message);
    return [];
  }
}

export default async function ChecklistsPage() {
  const checklists = await getChecklists(); // Получаем чеклисты

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Чеклисты</h1>
          <p className="text-lg text-gray-600">Полезные материалы для родителей и педагогов</p>
        </div>

        {/* Сетка чеклистов */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {checklists.map((checklist) => (
            <Card
              key={checklist.id}
              className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow"
              style={{ height: "480px" }}
            >
              <div className="h-48 bg-gradient-to-br from-green-100 to-green-200 relative flex-shrink-0">
                <div className="absolute top-4 left-4">
                  <span className="bg-white bg-opacity-90 text-gray-800 px-3 py-1 rounded-full text-xs font-medium">
                    {checklist.forAge}
                  </span>
                </div>
              </div>
              <CardContent className="flex flex-col flex-1 p-6">
                <div className="h-14 mb-4">
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-2 leading-tight">
                    {checklist.title}
                  </h3>
                </div>
                <div className="h-16 mb-4">
                  <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                    {checklist.description}
                  </p>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-6 flex-shrink-0">
                  <span>Чеклист</span>
                  <span>{checklist.forAge}</span>
                </div>
                <div className="mt-auto">
                  <Link href={checklist.url} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                      Открыть чеклист
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {checklists.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Чеклисты не найдены</h3>
            <p className="text-gray-600">Попробуйте позже</p>
          </div>
        )}

        <Action />
      </div>
    </div>
  );
}