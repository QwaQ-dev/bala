"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Play } from "lucide-react";

export default function VideoExercises() {
  const categories = {
    "Коммуникативные": {
      icon: "🗣️",
      videos: ["/videos/коммуникативные/1.mp4", "/videos/коммуникативные/2.mp4", "/videos/коммуникативные/3.mp4"],
    },
    "Сенсор": {
      icon: "👁️",
      subcategories: {
        "Вестибулярка": ["/videos/нейро/вестибулярка/1.mp4", "/videos/нейро/вестибулярка/2.mp4"],
        "Зрительная": ["/videos/нейро/зрительная/1.mp4", "/videos/нейро/зрительная/2.mp4"],
        "Проприоцепция": ["/videos/нейро/проприоцепция/1.mp4", "/videos/нейро/проприоцепция/2.mp4"],
        "Тактильная": ["/videos/нейро/тактильная система/1.mp4"],
      },
    },
    "Нейро": {
      icon: "🧠",
      videos: ["/videos/сенсор/1.mp4", "/videos/сенсор/2.mp4", "/videos/сенсор/3.mp4"],
    },
    "АФК": {
      icon: "🏃",
      videos: ["/videos/категория афк/афк/1.mp4", "/videos/категория афк/афк/2.mp4"],
    },
  };

  const [activeCategory, setActiveCategory] = useState("Коммуникативные");

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6">Упражнения</h2>

      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="flex justify-start gap-2 mb-6 overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {Object.entries(categories).map(([name, data]) => (
            <TabsTrigger
              key={name}
              value={name}
              className="flex items-center px-4 py-2 text-sm sm:text-base min-w-[120px] justify-center"
            >
              <span className="mr-2">{data.icon}</span> {name}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(categories).map(([name, data]) => (
          <TabsContent key={name} value={name}>
            {"subcategories" in data ? (
              Object.entries(data.subcategories).map(([sub, videos]) => (
                <div key={sub} className="mb-6">
                  <h3 className="text-lg sm:text-xl font-semibold mb-3">{sub}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {videos.map((src, idx) => (
                      <Card key={idx} className="overflow-hidden shadow-md">
                        <CardHeader className="p-2">
                          <CardTitle className="text-sm sm:text-base flex items-center">
                            <Play className="w-4 h-4 mr-1" /> Видео {idx + 1}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <video
                            controls
                            className="w-full h-48 sm:h-64 object-cover"
                            preload="metadata"
                          >
                            <source src={src} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.videos.map((src, idx) => (
                  <Card key={idx} className="overflow-hidden shadow-md">
                    <CardHeader className="p-2">
                      <CardTitle className="text-sm sm:text-base flex items-center">
                        <Play className="w-4 h-4 mr-1" /> Видео {idx + 1}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <video
                        controls
                        className="w-full h-48 sm:h-64 object-cover"
                        preload="metadata"
                      >
                        <source src={src} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}