import HeroSection from "@/components/HeroSection";
import CourseSection from "@/components/CourseSection";
import ChecklistSection from "@/components/ChecklistSection";
import ArticlesSection from "@/components/ArticlesSection";
// import MethodologySection from "@/components/MethodologySection";
import ConsultationSection from "@/components/ConsultationSection";
import Footer from "@/components/Footer";
import VideoExercises from "@/components/VideoExercises"

// ISR: страница будет перегенерироваться каждые 1800 секунд (30 минут)
export const revalidate = 1800;

// 🔹 универсальный helper
async function safeFetchJson(url, options = {}) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      console.error("[safeFetchJson] Bad status:", res.status);
      return {};
    }
    const text = await res.text();
    return text ? JSON.parse(text) : {};
  } catch (err) {
    return {};
  }
}

export default async function Home() {
  let articles = [];

  const data = await safeFetchJson("/api/articles", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    next: { revalidate: 1800 },
  });


    if (Array.isArray(data.articles)) {
      articles = data.articles
        .slice(0, 3)
        .map((article) => ({
          ...article,
          description: article.description || extractDescription(article.content),
        }));
    } else if (Array.isArray(data)) {
      articles = data
        .slice(0, 3)
        .map((article) => ({
          ...article,
          description: article.description || extractDescription(article.content),
        }));
    } else {

      articles = [];
    }


  return (
    <main className="min-h-screen">
      <HeroSection />
      <CourseSection />
      <VideoExercises/>
      <ChecklistSection />
      <ArticlesSection articles={articles} />
      {/* <MethodologySection /> */}
      <ConsultationSection />
      <Footer />
    </main>
  );
}

function extractDescription(html) {
  if (!html) return "Описание отсутствует";
  const text = html.replace(/<[^>]+>/g, "").trim(); // Remove HTML tags
  return text.length > 150
    ? text.slice(0, 150) + "..."
    : text || "Описание отсутствует";
}
