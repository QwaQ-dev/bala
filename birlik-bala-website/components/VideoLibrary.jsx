"use client"

import { useState } from "react"

// Статическая структура категорий (можно будет вынести в JSON)
const categories = {
  "сенсорные": {
    "": ["/videos/сенсорные/video1.mp4", "/videos/сенсорные/video2.mp4"]
  },
  "афк": {
    "подкатегория1": ["/videos/афк/подкатегория1/video3.mp4", "/videos/афк/подкатегория1/video4.mp4"]
  },
  "нейро": {
    "": ["/videos/нейро/video5.mp4"]
  },
  "коммуникативные": {
    "": ["/videos/коммуникативные/video6.mp4"]
  }
}

export default function VideoLibrary() {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState(null)
  const [selectedVideo, setSelectedVideo] = useState(null)

  return (
    <div className="p-6">
      {/* Категории */}
      {!selectedCategory && (
        <div className="grid grid-cols-2 gap-4">
          {Object.keys(categories).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="p-4 rounded-xl shadow bg-blue-500 text-white font-bold hover:bg-blue-600 transition"
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Подкатегории */}
      {selectedCategory && !selectedSubcategory && (
        <div>
          <button
            onClick={() => setSelectedCategory(null)}
            className="mb-4 px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          >
            ← Назад
          </button>
          <div className="grid grid-cols-2 gap-4">
            {Object.keys(categories[selectedCategory]).map((sub) => (
              <button
                key={sub || "default"}
                onClick={() => setSelectedSubcategory(sub)}
                className="p-4 rounded-xl shadow bg-green-500 text-white font-bold hover:bg-green-600 transition"
              >
                {sub || "Видео"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Видео список */}
      {selectedCategory && selectedSubcategory !== null && !selectedVideo && (
        <div>
          <button
            onClick={() => setSelectedSubcategory(null)}
            className="mb-4 px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          >
            ← Назад
          </button>
          <div className="grid grid-cols-2 gap-4">
            {categories[selectedCategory][selectedSubcategory].map((video, idx) => (
              <button
                key={video}
                onClick={() => setSelectedVideo(video)}
                className="p-4 rounded-xl shadow bg-purple-500 text-white font-bold hover:bg-purple-600 transition"
              >
                Видео {idx + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Видео плеер */}
      {selectedVideo && (
        <div>
          <button
            onClick={() => setSelectedVideo(null)}
            className="mb-4 px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          >
            ← Назад
          </button>
          <video controls className="w-full rounded-xl shadow-lg">
            <source src={selectedVideo} type="video/mp4" />
            Ваш браузер не поддерживает видео.
          </video>
        </div>
      )}
    </div>
  )
}
