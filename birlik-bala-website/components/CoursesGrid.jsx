import { Button } from "@/components/ui/button"


export default function CoursesGrid({ courses }) {
  const handleRedirect = () => {
    window.location.href = "https://wa.me/77001234567"; // замени номер
  };

  if (!courses || courses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Курсы не найдены</h3>
          <p className="text-gray-500">В данный момент нет доступных курсов</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      {courses.map((course) => (
        <div
          key={course.id}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h3>
            <p className="text-gray-600 mb-4 line-clamp-3">{course.description}</p>

            <div className="space-y-2 mb-4">
              {course.duration && (
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium">Длительность:</span>
                  <span className="ml-2">{course.duration}</span>
                </div>
              )}
              {course.level && (
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium">Уровень:</span>
                  <span className="ml-2">{course.level}</span>
                </div>
              )}
              {course.price && (
                <div className="flex items-center text-sm text-gray-900 font-semibold">
                  <span>Цена: {course.price} ₽</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleRedirect} className="flex-1 bg-blue-600 hover:bg-blue-700">Подробнее</Button>
              <Button onClick={handleRedirect} variant="outline" className="flex-1 bg-transparent">
                Записаться
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
