"use client"

import Link from "next/link"
import { Button } from "./ui/button"
import { useState, useEffect } from "react"
import { User, LogOut, ChevronDown } from "lucide-react"

export default function Header() {
  const [user, setUser] = useState(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  useEffect(() => {
    // Проверяем авторизацию при загрузке
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error("Error parsing user data:", error)
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    setIsDropdownOpen(false)
    window.location.href = "/"
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              BIRLIK BALA
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8">
            <Link href="/courses" className="text-gray-600 hover:text-gray-900">
              Курсы
            </Link>
            <Link href="/videos" className="text-gray-600 hover:text-gray-900">
              Видео
            </Link>
            <Link href="/checklists" className="text-gray-600 hover:text-gray-900">
              Чек-листы
            </Link>
            <Link href="/articles" className="text-gray-600 hover:text-gray-900">
              Статьи
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              // Авторизированный пользователь
              <>
                <Link href="/consultation">
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg">
                    Онлайн-консультация
                  </Button>
                </Link>

                {/* Dropdown с профилем */}
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-medium">{user.username}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                        <div className="font-medium">{user.username}</div>
                        <div className="text-xs text-gray-500">Пользователь</div>
                      </div>

                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Мой профиль
                      </Link>

                      <Link
                        href="/courses"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Мои курсы
                      </Link>

                      <Link
                        href="/admin/create-article"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Создать статью
                      </Link>

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
              </>
            ) : (
              // Неавторизированный пользователь
              <>
                <Link href="/consultation">
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg">
                    Онлайн-консультация
                  </Button>
                </Link>

                <Link href="/auth">
                  <Button variant="outline" className="text-gray-600 border-gray-300 hover:bg-gray-50 bg-transparent">
                    Войти
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Закрытие dropdown при клике вне его */}
      {isDropdownOpen && <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>}
    </header>
  )
}
