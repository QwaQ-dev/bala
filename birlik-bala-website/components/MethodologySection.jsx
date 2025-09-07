"use client"

import { Swiper, SwiperSlide } from "swiper/react"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import { Navigation, Pagination } from "swiper/modules"
import { Card, CardContent } from "@/components/ui/card"

const videos = [
  {
    id: "rihWH4fvvoQ",
    title: "Вестибулярная система",
    description:
      "Вестибулярная система — это наш внутренний компас и якорь равновесия. Она помогает телу удерживать баланс, координировать движения и ощущать направление в пространстве.",
    duration: "6 мин",
  },
  {
    id: "6sTpfNg05NY",
    title: "Зрительная система",
    description:
      "Зрительная система — это не только глаза, но и работа мозга, который учится обрабатывать увиденное. Она помогает ребёнку ориентироваться в пространстве, различать предметы, формы, цвета и даже выражения лиц.",
    duration: "4 мин",
  },
  {
    id: "uPZZkkCiJto",
    title: "Проприоцепция",
    description:
      "Проприоцептивная система — это наше внутреннее чувство тела. Благодаря ей мы понимаем, где находятся наши руки и ноги, с какой силой нужно толкнуть, поднять или сжать предмет.",
    duration: "5 мин",
  },
  {
    id: "LWsA4tfhlok",
    title: "Слуховая система",
    description:
      "Слуховая система — это не только умение слышать звуки. Она помогает ребёнку ориентироваться в пространстве, различать речь, понимать интонацию и даже контролировать собственный голос.",
    duration: "4 мин",
  },
  {
    id: "J_DYINjHq9Y",
    title: "Тактильная система",
    description:
      "Тактильная система — это наша кожа, самый большой орган чувств. Она помогает ребёнку познавать мир через прикосновения: гладкое и шероховатое, мягкое и твёрдое, холодное и тёплое.",
    duration: "3 мин",
  },
]

export default function MethodologySection() {
  return (
    <section className="py-12 sm:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Познакомьтесь с методологией
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Посмотрите, как работает АВА-терапия и специальная методология на практике
          </p>
        </div>

        {/* Слайдер */}
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={16}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          breakpoints={{
            640: { slidesPerView: 1, spaceBetween: 20 },
            768: { slidesPerView: 2, spaceBetween: 24 },
            1024: { slidesPerView: 3, spaceBetween: 24 },
          }}
          className="pb-10"
        >
          {videos.map((video, idx) => (
            <SwiperSlide key={idx} className="h-full">
              <Card className="h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden bg-white flex flex-col">
                <CardContent className="p-0 flex flex-col h-full">
                  {/* Видео фиксированного размера (16:9) */}
                  <div className="relative w-full aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${video.id}`}
                      title={video.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full rounded-t-2xl"
                    ></iframe>

                    {/* Таймер в углу */}
                    <div className="absolute top-3 left-3 bg-white bg-opacity-90 rounded-lg px-2 py-0.5 sm:px-3 sm:py-1 shadow-sm">
                      <span className="text-xs sm:text-sm font-medium text-gray-700">
                        {video.duration}
                      </span>
                    </div>
                  </div>

                  {/* Текстовый блок фиксированной высоты */}
                  <div className="p-4 sm:p-5 flex flex-col justify-between flex-grow h-[220px]">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {video.title}
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-4">
                      {video.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}
