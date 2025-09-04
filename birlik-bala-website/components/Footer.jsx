
export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-green-800 to-green-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">BIRLIK BALA</h3>
            <p className="text-green-200 mb-4 text-sm leading-relaxed">
              Помогаем родителям лучше понимать своих детей через воспитание в духе. Специализируемся на АВА и
              специальной методологии.
            </p>
          </div>


          <div>
            <h4 className="text-lg font-semibold mb-4">Контакты</h4>
            <ul className="space-y-2 text-green-200 text-sm">
              <li>Телефон: +7 (701) 840 92 29</li>
              <li>Telegram: @putryadom</li>
              <li>WhatsApp: +7 (701) 840 92 29</li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Социальные сети</h4>
            <ul className="space-y-2 text-green-200 text-sm">
              <li>
                <a href="https://www.instagram.com/prostojigit" className="hover:text-white transition-colors">
                  Instagram
                </a>
              </li>
              <li>
                <a href="https://wa.me/77018409229" className="hover:text-white transition-colors">
                  WhatsApp
                </a>
              </li>
              <li>
                <a href="https://t.me/putryadom" className="hover:text-white transition-colors">
                  Telegram
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-green-700 mt-8 pt-8 text-center text-green-200 text-sm">
          <p>&copy; 2025 BIRLIK BALA. Все права защищены.</p>
        </div>
      </div>
    </footer>
  )
}
