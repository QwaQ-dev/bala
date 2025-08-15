import { Inter } from "next/font/google"
import "@/styles/globals.css"
import Header from "@/components/Header"
import {UserProvider} from "@/context/UserContext"


const inter = Inter({ subsets: ["latin", "cyrillic"] })

export const metadata = {
  title: "BIRLIK BALA - Развитие детей через воспитание в духе",
  description:
    "Помогаем родителям лучше понимать своих детей через воспитание в духе. Специализируемся на АВА и специальной методологии.",
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        {/* <UserProvider> */}
          <Header/>
          {children}  
        {/* </UserProvider> */}
      </body>
    </html>
  )
}
