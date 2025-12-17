// components/dashboard/sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  MessageSquare, 
  Clock, 
  Settings, 
  Code,
  ExternalLink,
  Mail,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface SidebarProps {
  customer: any
  workspaces: any[]
}

export default function DashboardSidebar({ customer, workspaces }: SidebarProps) {
  const pathname = usePathname()
  const currentWorkspace = workspaces[0] // For MVP, use first workspace

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Testimonials', href: '/dashboard/testimonials', icon: MessageSquare },
    { name: 'Moderation', href: '/dashboard/testimonials/moderation', icon: Clock },
    { name: 'Email Campaigns', href: '/dashboard/campaigns', icon: Mail }, // NEW
    { name: 'Embed Widget', href: '/dashboard/embed', icon: Code },
    //{ name: 'A/B Testing', href: '/dashboard/ab-testing', icon: BarChart3 }, // NEW
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ]

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">TB</span>
          </div>
          <span className="font-bold text-xl text-gray-900">TrustedBy</span>
        </Link>
      </div>

      {/* Workspace Selector */}
      {currentWorkspace && (
        <div className="px-4 py-4 border-b border-gray-200">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
            Workspace
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="font-medium text-sm text-gray-900">
              {currentWorkspace.name}
            </div>
            <Link 
              href={`/w/${currentWorkspace.slug}`}
              target="_blank"
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center mt-1"
            >
              View public page <ExternalLink className="w-3 h-3 ml-1" />
            </Link>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive ? 'text-blue-700' : 'text-gray-500')} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Subscription Status */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className={cn(
          'px-3 py-2 rounded-lg text-xs font-medium',
          customer?.subscription_status === 'active' 
            ? 'bg-green-50 text-green-700'
            : customer?.subscription_status === 'lifetime'
            ? 'bg-purple-50 text-purple-700'
            : 'bg-yellow-50 text-yellow-700'
        )}>
          {customer?.subscription_status === 'active' && '✓ Pro Plan'}
          {customer?.subscription_status === 'lifetime' && '⭐ Lifetime Access'}
          {customer?.subscription_status === 'trial' && '⏱️ Trial'}
        </div>
      </div>
    </div>
  )
}