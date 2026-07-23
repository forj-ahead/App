'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { LayoutDashboard, Phone, Settings, Users, FileText, LogOut, BarChart2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface AppSidebarProps {
  user: { email?: string } | null
  profile: { role: string } | null
  newLeadCount?: number
}


const clientNav = [
  { href: '/dashboard', label: 'Leads', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/calls', label: 'Calls', icon: Phone, exact: false },
  { href: '/dashboard/reports', label: 'Reports', icon: BarChart2, exact: false },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, exact: false },
]

const adminNav = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/clients', label: 'Clients', icon: Users, exact: false },
  { href: '/admin/templates', label: 'Templates', icon: FileText, exact: false },
]

export function AppSidebar({ user, profile, newLeadCount = 0 }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const isAdmin = profile?.role === 'admin'
  const nav = isAdmin ? adminNav : clientNav

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-52 flex-shrink-0 flex flex-col h-screen sticky top-0 bg-[#080e1a] border-r border-slate-800/60">
      {/* Logo */}
      <div className="h-14 px-4 flex items-center border-b border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <Image src="/logo-icon.png" alt="Forj" width={28} height={28} className="rounded-lg flex-shrink-0" />
          <span className="text-white font-semibold text-sm tracking-tight">Forj</span>
        </div>
        {isAdmin && (
          <span className="ml-auto text-[10px] font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/25 px-1.5 py-0.5 rounded">
            Admin
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
                active
                  ? 'bg-blue-500/15 text-blue-300 font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 font-normal'
              )}
            >
              <Icon size={14} className={active ? 'text-blue-400' : 'text-slate-600'} />
              {label}
              {label === 'Leads' && newLeadCount > 0 && (
                <span className="ml-auto text-[10px] font-bold bg-blue-500 text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none">
                  {newLeadCount > 99 ? '99+' : newLeadCount}
                </span>
              )}
            </Link>
          )
        })}

        {isAdmin && (
          <>
            <div className="pt-4 pb-1.5 px-3">
              <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">Client view</span>
            </div>
            {clientNav.map(({ href, label, icon: Icon, exact }) => (
              <Link
                key={`c-${href}`}
                href={href}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
                  isActive(href, exact)
                    ? 'bg-blue-500/15 text-blue-300 font-medium'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/60'
                )}
              >
                <Icon size={14} className="text-slate-700" />
                {label}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="px-2 py-3 border-t border-slate-800/60">
        <div className="px-3 py-1.5 mb-1">
          <p className="text-slate-600 text-xs truncate">{user?.email}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-sm text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition-colors"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
