import { Card, CardContent } from "@/components/ui/card"

export default function ChecklistSection() {
  const checklists = [
    {
      title: "Произношение",
      description: "10 упражнений для развития правильного произношения и артикуляции у детей",
      color: "bg-pink-500",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-200",
    },
    {
      title: "Произношение",
      description: "10 упражнений для развития правильного произношения и артикуляции у детей",
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      title: "Произношение",
      description: "10 упражнений для развития правильного произношения и артикуляции у детей",
      color: "bg-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      title: "Произношение",
      description: "10 упражнений для развития правильного произношения и артикуляции у детей",
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
    },
  ]

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
              className={`${checklist.bgColor} ${checklist.borderColor} border-2 hover:shadow-lg transition-shadow`}
            >
              <CardContent className="p-6">
                <div className={`w-12 h-12 ${checklist.color} rounded-xl mb-4 flex items-center justify-center`}>
                  <span className="text-white font-bold text-xl">✓</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{checklist.title}</h3>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">{checklist.description}</p>
                <button
                  className={`w-full py-3 px-4 ${checklist.color} text-white rounded-lg hover:opacity-90 transition-opacity font-medium`}
                >
                  Скачать
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
