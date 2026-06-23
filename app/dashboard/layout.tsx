// app/dashboard/layout.tsx
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import DashboardNavbar from '@/components/DashboardNavbar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className="dashboard-container">
      <DashboardNavbar />
      <main className="min-h-screen bg-gray-50">
        {children}
      </main>
    </div>
  )
}