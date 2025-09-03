import { Card, CardContent } from "@/components/ui/card";

export const revalidate = 1800; // ISR: обновляем данные раз в 60 секунд

export default async function ChecklistSection() {
  let checklists = [];

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/checklists`, {
      next: { revalidate: 1800 }, // ISR
    });
    const data = await res.json();
    checklists = Array.isArray(data) ? data.slice(0, 4) : [];
  } catch (err) {
    console.error("Error fetching checklists:", err);
  }

  return (
    <section className="py-8 sm:py-12 md:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4">
            Чек-листы для домашних занятий
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto">
            Готовые практические материалы для эффективных занятий с ребенком дома
          </p>
        </div>

        {checklists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {checklists.map((checklist, index) => (
              <Card
                key={index}
                className="border-2 border-gray-200 bg-white shadow-sm hover:shadow-lg transition-shadow flex flex-col"
              >
                <CardContent className="flex flex-col h-full p-3 sm:p-4 md:p-6">
                  <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-500 rounded-xl mb-2 sm:mb-3 md:mb-4 flex items-center justify-center">
                    <span className="text-white font-bold text-lg sm:text-xl">✓</span>
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                    {checklist.title}
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6 flex-grow line-clamp-3 leading-relaxed">
                    {checklist.description}
                  </p>
                  <button className="w-full py-2 sm:py-3 px-3 sm:px-4 bg-blue-500 text-white rounded-lg hover:opacity-90 transition-opacity font-medium text-sm sm:text-base">
                    Скачать
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8 md:py-12 text-gray-600 border-2 border-dashed border-gray-300 rounded-xl bg-white">
            <p className="text-base sm:text-lg font-medium">Чеклисты пока недоступны</p>
            <p className="text-sm sm:text-base text-gray-500 mt-1 sm:mt-2">
              Загляните позже, мы обновим материалы.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}