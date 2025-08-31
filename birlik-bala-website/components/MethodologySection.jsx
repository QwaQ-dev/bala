"use client"

import { Swiper, SwiperSlide } from "swiper/react"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import { Navigation, Pagination } from "swiper/modules"
import { Card, CardContent } from "@/components/ui/card"

const videos = [
  {
    id: "ScMzIvxBSi4",
    title: "Знакомство с методологией",
    description: "Как АВА-терапия применяется на практике",
    duration: "5 мин"
  },
  {
    id: "dQw4w9WgXcQ",
    title: "Практические занятия",
    description: "Реальные примеры работы со специалистом",
    duration: "7 мин"
  },
  {
    id: "LXb3EKWsInQ",
    title: "Опыт родителей",
    description: "Истории семей, которые прошли программу",
    duration: "4 мин"
  },
  {
    id: "M7lc1UVf-VE",
    title: "Первые шаги",
    description: "Что ожидать в начале терапии",
    duration: "6 мин"
  }
]

export default function MethodologySection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Познакомьтесь с методологией
          </h2>
          <p className="text-lg text-gray-600">
            Посмотрите, как работает АВА-терапия и специальная методология на практике
          </p>
        </div>

        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={24}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {videos.map((video, idx) => (
            <SwiperSlide key={idx}>
              <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden bg-white">
                <CardContent className="p-0">
                  <div className="relative h-56">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${video.id}`}
                      title={video.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 rounded-t-2xl"
                    ></iframe>
                    <div className="absolute top-3 left-3 bg-white bg-opacity-90 rounded-lg px-3 py-1 shadow-sm">
                      <span className="text-sm font-medium text-gray-700">{video.duration}</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{video.title}</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{video.description}</p>
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
