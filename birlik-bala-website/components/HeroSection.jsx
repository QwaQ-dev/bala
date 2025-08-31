import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Play, Star } from "lucide-react"

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-green-50 via-blue-50 to-green-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              АС-САЛАМУ
              <br />
              АЛЕЙКУМ
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Я — Маргулан Косаев, специалист по АФК и сенсорной интеграции.
За 3 года работы я помог 200+ детям с особенностями развития укрепить тело, улучшить внимание и освоить новые навыки.

Моя миссия — сделать так, чтобы каждый ребёнок чувствовал радость движения, а родители понимали, как правильно поддерживать его дома.
Здесь мы вместе учимся не только упражнениям, но и тому, как видеть сильные стороны ребёнка и развивать их каждый день.
            </p>
            
            <div className="flex items-center space-x-4 mb-8">
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-3 rounded-lg">
                Записаться
              </Button>
            </div>

            <div className="flex items-center space-x-8">
              <div>
                <div className="text-3xl font-bold text-gray-900">200+</div>
                <div className="text-sm text-gray-600">учеников</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">3+</div>
                <div className="text-sm text-gray-600">лет опыта</div>
              </div>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-sm text-gray-600 ml-2">4.9</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="relative h-80 w-full mb-4">
                <Image
                  src="/images/hero-illustration.png"
                  alt="Ребенок читает книгу на природе"
                  fill
                  className="object-cover rounded-2xl"
                />
              </div>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-green-100 rounded-xl p-4 flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">👤</span>
                  </div>
                  <div className="text-sm text-green-800 font-medium">Индивидуальный подход к каждому ребенку</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
