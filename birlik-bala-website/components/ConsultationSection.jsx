"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check } from "lucide-react"

export default function ConsultationSection() {
  const handleRedirect = (pkgName) => {
    const phone = "77053245524"
    const message = pkgName
      ? `Здравствуйте! Хочу записаться на ${pkgName}.`
      : "Здравствуйте! Хочу записаться на консультацию."
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    window.open(url, "_blank")
  }

  const benefits = [
    {
      title: "Анализ ситуации на 100%",
      description: "Детальный разбор особенностей развития ребенка",
    },
    {
      title: "Рекомендации и план действий",
      description: "Конкретные шаги для решения проблем",
    },
    {
      title: "Сопровождение в WhatsApp",
      description: "Поддержка и ответы на вопросы в течение недели",
    },
  ]

  const packages = [
    {
      name: "Базовая консультация (бесплатно)",
      description: [
        "Подходит, если вы хотите просто понять, с чего начать.",
        "Определяю особенности ребёнка.",
        "Создаю сенсорный профиль (какие системы перегружены, какие требуют развития).",
        "Даю первые рекомендации для домашних занятий.",
        "✨ Отличный старт, чтобы понять направление."
      ],
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600",
    },
    {
      name: "Расширенная консультация + сопровождение (10 000 тг)",
      description: [
        "Для родителей, которым важно двигаться системно и под контролем специалиста.",
        "Подробная диагностика + расширенный сенсорный профиль.",
        "Индивидуальный план занятий на месяц.",
        "Подбор упражнений именно под вашего ребёнка.",
        "Контроль выполнения: связь по WhatsApp, корректировка программы.",
        "Ответы на все ваши вопросы в процессе.",
        "🔥 Формат для тех, кто хочет не просто советы, а результат."
      ],
      color: "bg-orange-500",
      hoverColor: "hover:bg-orange-600",
    },
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Левая сторона */}
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Онлайн-консультации</h2>
            <p className="text-lg text-gray-600 mb-8">
              Получите персональную помощь и рекомендации для вашего ребенка
            </p>

            <div className="space-y-6 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-4 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{benefit.title}</h4>
                    <p className="text-gray-600 text-sm">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={() => handleRedirect()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg rounded-lg shadow"
            >
              Записаться на консультацию
            </Button>
          </div>

          {/* Правая сторона */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Выберите формат</h3>

            <div className="space-y-6">
              {packages.map((pkg, index) => (
                <Card
                  key={index}
                  className="border-2 border-gray-200 bg-white hover:shadow-xl transition-shadow rounded-xl overflow-hidden"
                >
                  <CardContent className="p-6">
                    <h4 className={`text-xl font-bold mb-4 ${pkg.color.replace("bg", "text")}`}>
                      {pkg.name}
                    </h4>
                    <div className="space-y-2 mb-4">
                      {pkg.description.map((line, i) => (
                        <div key={i} className="flex items-start space-x-2">
                          <span className="text-green-600 mt-1">•</span>
                          <p className="text-gray-700 text-sm">{line}</p>
                        </div>
                      ))}
                    </div>
                    <Button
                      onClick={() => handleRedirect(pkg.name)}
                      className={`w-full ${pkg.color} ${pkg.hoverColor} text-white py-3 rounded-lg shadow`}
                    >
                      Выбрать
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
