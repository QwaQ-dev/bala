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
    window.location.href = url
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
      name: "Базовая консультация",
      price: "5,000₸",
      duration: "45 минут",
      features: "Анализ ситуации • Рекомендации",
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600",
      isPopular: false,
    },
    {
      name: "Расширенная консультация",
      price: "8,000₸",
      duration: "90 минут",
      features: "Детальный план • Поддержка в WhatsApp",
      color: "bg-orange-500",
      hoverColor: "hover:bg-orange-600",
      isPopular: true,
    },
    {
      name: "VIP консультация",
      price: "12,000₸",
      duration: "120 минут",
      features: "Индивидуальная программа • Месяц поддержки",
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600",
      isPopular: false,
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
                <div key={index} className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">{benefit.title}</h4>
                    <p className="text-gray-600 text-sm">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={() => handleRedirect()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
            >
              Записаться на консультацию
            </Button>
          </div>

          {/* Правая сторона */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Выберите формат</h3>

            <div className="space-y-4">
              {packages.map((pkg, index) => (
                <div key={index} className="relative">
                  {pkg.isPopular && (
                    <div className="absolute -top-3 left-4 z-10">
                      <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                        Популярный
                      </span>
                    </div>
                  )}

                  <Card
                    className={`border-2 hover:shadow-lg transition-shadow ${
                      pkg.isPopular ? "border-orange-200 bg-orange-50" : "border-gray-200 bg-white"
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">{pkg.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {pkg.duration} • {pkg.features}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">{pkg.price}</div>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleRedirect(pkg.name)}
                        className={`w-full ${pkg.color} ${pkg.hoverColor} text-white py-3`}
                      >
                        Выбрать
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
