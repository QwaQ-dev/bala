"use client";
import { Button } from "./ui/button";

export default function Action() {
  const handleRedirect = () => {
    const phone = "77001234567";
    const message = "Здравствуйте! Хочу записаться на консультацию.";
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.location.href = url;
  };

  return (
    <div className="mt-16 bg-blue-50 rounded-lg p-8 text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Нужна персональная помощь?</h2>
      <p className="text-gray-600 mb-6">
        Получите индивидуальную консультацию и рекомендации от наших специалистов
      </p>
      <Button
        onClick={handleRedirect}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        Записаться на консультацию
      </Button>
    </div>
  );
}
