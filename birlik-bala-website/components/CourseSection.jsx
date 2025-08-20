import { Button } from "@/components/ui/button"
import { Check, Calendar, Flame } from "lucide-react"


export default function CourseSection() {
  const handleRedirect = () => {
    window.location.href = "https://wa.me/77001234567"; // замени номер
  };

  const features = [
    "20+ практических и теоретических заданий",
    "Поддержка специалиста в чате",
    "Сертификат о прохождении курса",
    "Доступ к материалам навсегда",
  ]

  const courseModules = [
    "Модуль 1: Теоретические основы",
    "Модуль 2: Домашние методики",
    "Модуль 3: Социальная интеграция",
    "Бонус: Индивидуальная консультация",
  ]
  
  const courseInside = [
    "Теоретические основы и принципы",
    "Конкретные методы работы",
    "Работа с сенсорными особенностями",
    "60 минут персональной работы"
  ]

  return (
    <section className="bg-gradient-to-r from-green-600 to-blue-600 py-16 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="inline-block mb-10">
          <div className="bg-white/20 w-full flex items-center p-3 rounded-xl">
            <Flame/>
            <span className="whitespace-nowrap ml-2">Ограниченное предложение</span>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-4xl font-bold mb-6">Полный курс по АФК</h2>
            <p className="text-lg mb-8 opacity-90">
              Изучайте основы обучения для родителей. Научитесь эффективно работать с поведением ребенка и развивать его
              навыки.
            </p>

            <div className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex items-baseline space-x-4 mb-8">
              <div className="text-4xl font-bold">15 000₸</div>
              <div className="text-lg opacity-75">за курс</div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
              <Button onClick = {handleRedirect}className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg">
                Купить курс сейчас
              </Button>
              <Button
                variant="outline"
                onClick={handleRedirect}
                className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent rounded-lg"
              >
                Узнать подробнее
              </Button>
            </div>

            <div className="flex items-center space-x-2 text-sm opacity-75">
              <Calendar className="w-4 h-4 bg-white bg-opacity-20 rounded"/>
              <span>Акция действует до 31 января</span>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-6">Что входит в курс:</h3>
            <div className="space-y-4">
              {courseModules.map((module, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-sm font-bold mt-1 flex-shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <span className="text-lg">{module}</span>
                    <p className="p-2 color-course">{module}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
