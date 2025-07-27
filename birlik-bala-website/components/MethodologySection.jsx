import { Card, CardContent } from "@/components/ui/card"
import { Play } from "lucide-react"

export default function MethodologySection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Познакомьтесь с методологией</h2>
          <p className="text-lg text-gray-600">
            Посмотрите, как работает АВА-терапия и специальная методология на практике
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
           <Card className="bg-blue-50 border-0 hover:shadow-lg transition-shadow overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 h-48 relative overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/ScMzIvxBSi4"
                  title="Практические занятия"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0"
                ></iframe>
                <div className="absolute top-4 left-4 bg-white bg-opacity-90 rounded-lg px-3 py-1">
                  <span className="text-sm font-medium text-gray-700">Практические занятия</span>
                  <div className="text-xs text-gray-500">5 мин</div>
                </div>
              </div>
              <div className="p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-2">Знакомство со специалистом</h4>
                <p className="text-gray-600 text-sm">
                  Узнайте о нашем подходе к работе с детьми, методах и принципах, которые мы используем в своей
                  практике.
                </p>
              </div>
            </CardContent>
          </Card>

           <Card className="bg-blue-50 border-0 hover:shadow-lg transition-shadow overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 h-48 relative overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/ScMzIvxBSi4"
                  title="Практические занятия"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0"
                ></iframe>
                <div className="absolute top-4 left-4 bg-white bg-opacity-90 rounded-lg px-3 py-1">
                  <span className="text-sm font-medium text-gray-700">Практические занятия</span>
                  <div className="text-xs text-gray-500">5 мин</div>
                </div>
              </div>
              <div className="p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-2">Знакомство со специалистом</h4>
                <p className="text-gray-600 text-sm">
                  Узнайте о нашем подходе к работе с детьми, методах и принципах, которые мы используем в своей
                  практике.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </section>
  )
}
