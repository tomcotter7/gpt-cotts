import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import { Providers } from "@/components/Providers"

const inter = Inter({ subsets: ['latin'] })

 export const metadata = {
   title: 'gpt-cotts',
   description: 'skill issues? use me.',
 }

export default function RootLayout({ children }) {
  return (
        <html lang="en">
          <body className={inter.className}>
            <Providers>
                <Navbar />
                {children}
            </Providers>
        </body>
        </html>
  )
}
