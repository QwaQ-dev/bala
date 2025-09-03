"use client";

import { Button } from "@/components/ui/button";

export default function CourseSection() {
  const features = [
    "Подборку упражнений для разных целей (баланс, моторика, внимание).",
    "Гайды для эффективной работы",
    "Сертификат о прохождении курса",
    "Доступ к материалам навсегда",
    "Чек-листы по (структуре урока, наблюдение, подсказки)."
  ];

  const courseModules = [
    "1. Введение – зачем нужны такие занятия, какую пользу они дают.",
    "2. Что такое АФК – простыми словами о сути адаптивной физкультуры.",
    "3. Особенности поведения – как работать с трудностями и не «ломать» ребёнка.",
    "4. Структура урока – из чего состоит занятие и как выстроить его грамотно.",
    "5. Методы подсказок и мотивации – как помочь ребёнку выполнить задание и сделать уроки интересными.",
    "6. 🎥 Финал: вебинар по составлению индивидуальной программы и диагностике ребёнка."
  ];

  const handleRedirect = (message) => {
    const phone = "77018409229"; // твой номер
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.location.href = url;
  };

  return (
    <section className="bg-gradient-to-r from-green-600 to-blue-600 py-16 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="inline-block mb-10">
          <div className="bg-white/20 w-full flex items-center p-3 rounded-xl">
            Ограниченное предложение
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-4xl font-bold mb-6">Полный курс по АФК</h2>
            <p className="text-lg mb-8 opacity-90">
              Курс для тех, кто хочет понять, как грамотно заниматься с ребёнком дома или в центре,
              особенно если есть особенности развития.
              <br/><br/>
              Вы получите не только теорию, но и готовые инструменты, которые можно применять сразу:
              упражнения, подсказки, структуры занятий.
            </p>

            <h2 className="text-xl font-bold">🎁 Дополнительно вы получите: </h2>
            <br/>

            <div className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <span>✔</span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex items-baseline space-x-4 mb-8">
              <div className="text-4xl font-bold">15 000₸</div>
              <div className="text-lg opacity-75">за курс</div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
              <Button
                onClick={() => handleRedirect("Здравствуйте! Я хочу купить курс по АФК.")}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg"
              >
                Купить курс сейчас
              </Button>
              <Button
                variant="outline"
                onClick={() => handleRedirect("Здравствуйте! Хотел(а) бы узнать подробнее о курсе по АФК.")}
                className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent rounded-lg"
              >
                Узнать подробнее
              </Button>
            </div>

            <div className="flex items-center space-x-2 text-sm opacity-75">
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
