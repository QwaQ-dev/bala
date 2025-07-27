import Header from "@/components/Header"
import HeroSection from "@/components/HeroSection"
import CourseSection from "@/components/CourseSection"
import ChecklistSection from "@/components/ChecklistSection"
import ArticlesSection from "@/components/ArticlesSection"
import MethodologySection from "@/components/MethodologySection"
import ConsultationSection from "@/components/ConsultationSection"
import Footer from "@/components/Footer"

// ISR: страница будет перегенерироваться каждые 3600 секунд (1 час)
export const revalidate = 3600

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <CourseSection />
      <ChecklistSection />
      <ArticlesSection />
      <MethodologySection />
      <ConsultationSection />
      <Footer />
    </main>
  )
}
