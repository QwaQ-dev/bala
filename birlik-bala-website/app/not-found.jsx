import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Страница не найдена</h2>
        <p className="text-gray-600 mb-8">Извините, запрашиваемая страница не существует.</p>
        <Link href="/">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Вернуться на главную
          </Button>
        </Link>
      </div>
    </div>
  )
}
