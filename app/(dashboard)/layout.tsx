// app/(dashboard)/layout.tsx
// Protected dashboard layout with sidebar navigation

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser, getUserWorkspaces } from '@/lib/supabase/queries'
import DashboardSidebar from '@/components/dashboard/sidebar'
import DashboardHeader from '@/components/dashboard/header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const customer = await getCurrentUser()
  const workspaces = await getUserWorkspaces(user.id)

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar 
        customer={customer} 
        workspaces={workspaces} 
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader customer={customer} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}