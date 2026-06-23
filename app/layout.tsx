import { Providers } from './providers'
import './globals.css'

export const metadata = {
  title: 'Ruta 64 - Plataforma Nacional de Talento',
  description: 'Conectamos talento mexicano con donaciones transparentes. Un peso transforma.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}