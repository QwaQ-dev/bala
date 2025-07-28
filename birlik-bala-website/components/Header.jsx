import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-gray-900">BIRLIK BALA</span>
          </div>

          <nav className="hidden md:flex space-x-8">
            <Link href="#" className="text-gray-600 hover:text-gray-900">
              Курсы
            </Link>
            <Link href="#" className="text-gray-600 hover:text-gray-900">
              Методология
            </Link>
            <Link href="#" className="text-gray-600 hover:text-gray-900">
              Материалы
            </Link>
            <Link href="#" className="text-gray-600 hover:text-gray-900">
              Статьи
            </Link>
            <Link href="#" className="text-gray-600 hover:text-gray-900">
              О проекте
            </Link>
          </nav>

          <div className="flex flex-row gap-10">
          <Link href="/sign-up">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg">
              Онлайн-консультация
            </Button>
          </Link>
          <Link href='/sign-in'>
            <Button>Войти</Button>
          </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
