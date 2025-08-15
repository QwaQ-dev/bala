"use client"

import Link from "next/link"
import { Button } from "./ui/button"
import { useState } from "react"
import { User, LogOut, ChevronDown, Menu } from "lucide-react"
import { useUser } from "@/context/UserContext"
import { clientCookies } from "@/lib/auth-cookies"

export default function Header() {
  const { user, logout } = useState("")

  const [isAdmin, setIsAdmin] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    // clientCookies.remove("access_token")
    logout()
    setIsDropdownOpen(false)
    window.location.href = "/"
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Левая часть - Логотип */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              BIRLIK BALA
            </Link>
          </div>

          {/* Центральная часть - Навигация */}
          <nav className="hidden lg:flex items-center space-x-8 flex-1 justify-center">
            <Link href="/courses" className="text-gray-600 hover:text-gray-900 transition-colors">
              Курсы
            </Link>
            <Link href="http://youtube.com" className="text-gray-600 hover:text-gray-900 transition-colors">
              Видео
            </Link>
            <Link href="/checklists" className="text-gray-600 hover:text-gray-900 transition-colors">
              Чек-листы
            </Link>
            <Link href="/articles" className="text-gray-600 hover:text-gray-900 transition-colors">
              Статьи
            </Link>
          </nav>

          {/* Правая часть - Кнопки и профиль */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {/* Мобильное меню */}
            <button
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Кнопка консультации */}
            <Link href="/consultation" className="hidden sm:block">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg whitespace-nowrap">
                Онлайн-консультация
              </Button>
            </Link>

            {user ? (
              // Авторизированный пользователь
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-medium hidden sm:block">{user.username}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                      <div className="font-medium">{user.username}</div>
                      <div className="text-xs text-gray-500">Пользователь</div>
                    </div>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Создать статью
                      </Link>
                    )}
                    <div className="border-t border-gray-100">
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Выйти</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Неавторизированный пользователь
              <Link href="/auth">
                <Button
                  variant="outline"
                  className="text-gray-600 border-gray-300 hover:bg-gray-50 bg-transparent whitespace-nowrap"
                >
                  Войти
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Закрытие dropdown при клике вне его */}
      {isDropdownOpen && <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>}
      {isMobileMenuOpen && <div className="fixed inset-0 z-30" onClick={() => setIsMobileMenuOpen(false)}></div>}
    </header>
  )
}
