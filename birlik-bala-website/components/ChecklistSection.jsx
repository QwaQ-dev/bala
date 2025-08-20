import { Card, CardContent } from "@/components/ui/card";

export const revalidate = 60; // ISR: обновляем данные раз в 60 секунд

export default async function ChecklistSection() {
  let checklists = [];

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/checklists`, {
      next: { revalidate: 60 }, // ISR
    });
    const data = await res.json();
    checklists = Array.isArray(data) ? data.slice(0, 4) : [];
  } catch (err) {
    console.error("Error fetching checklists:", err);
  }

  if (checklists.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        Чеклисты не найдены
      </div>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Чек-листы для домашних занятий</h2>
          <p className="text-lg text-gray-600">
            Готовые практические материалы для эффективных занятий с ребенком дома
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {checklists.map((checklist, index) => (
            <Card
              key={index}
              className="border-2 border-gray-200 bg-white shadow-sm hover:shadow-lg transition-shadow flex flex-col"
            >
              <CardContent className="flex flex-col h-full p-6">
                <div className="w-12 h-12 bg-blue-500 rounded-xl mb-4 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">✓</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{checklist.title}</h3>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed flex-grow">
                  {checklist.description}
                </p>
                <button className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg hover:opacity-90 transition-opacity font-medium">
                  Скачать
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
