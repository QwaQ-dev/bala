
import HeroSection from "@/components/HeroSection";
import CourseSection from "@/components/CourseSection";
import ChecklistSection from "@/components/ChecklistSection";
import ArticlesSection from "@/components/ArticlesSection";
import MethodologySection from "@/components/MethodologySection";
import ConsultationSection from "@/components/ConsultationSection";
import Footer from "@/components/Footer";

// ISR: страница будет перегенерироваться каждые 3600 секунд (1 час)
export const revalidate = 3600;

export default async function Home() {
  console.log("[Home] Fetching articles via proxy at", new Date().toISOString());
  let articles = [];

  try {
    const response = await fetch("http://localhost:3000/api/articles", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 3600 }, // Cache and revalidate every hour
    });
    console.log("[Home] Proxy response status:", response.status);

    if (!response.ok) {
      console.error("[Home] Failed to fetch articles from proxy:", response.status);
    } else {
      const contentType = response.headers.get("content-type");
      const responseText = await response.text();
      console.log("[Home] Proxy response content-type:", contentType);
      console.log("[Home] Proxy response body:", responseText);

      try {
        const data = JSON.parse(responseText);
        articles = (data.articles || data)
          .slice(0, 3) // Limit to 3 articles
          .map((article) => ({
            ...article,
            description: article.description || extractDescription(article.content), // Fallback description
          }));
      } catch (parseError) {
        console.error("[Home] Ошибка парсинга JSON:", parseError.message, responseText);
      }
    }
  } catch (err) {
    console.error("[Home] Ошибка запроса к прокси:", { name: err.name, message: err.message });
  }

  return (
      <main className="min-h-screen">
        <HeroSection />
        <CourseSection />
        <ChecklistSection />
        <ArticlesSection articles={articles} />
        <MethodologySection />
        <ConsultationSection />
        <Footer />
      </main>
  );
}


function extractDescription(html) {
  if (!html) return "Описание отсутствует";
  const text = html.replace(/<[^>]+>/g, "").trim(); // Remove HTML tags
  return text.length > 150 ? text.slice(0, 150) + "..." : text || "Описание отсутствует";
}