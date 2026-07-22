'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Phone, Settings, Users, FileText, LogOut, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface AppSidebarProps {
  user: { email?: string } | null
  profile: { role: string } | null
}

const clientNav = [
  { href: '/dashboard', label: 'Leads', icon: LayoutDashboard },
  { href: '/dashboard/calls', label: 'All Calls', icon: Phone },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

const adminNav = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/clients', label: 'Clients', icon: Users },
  { href: '/admin/templates', label: 'Templates', icon: FileText },
]

export function AppSidebar({ user, profile }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const isAdmin = profile?.role === 'admin'
  const nav = isAdmin ? adminNav : clientNav

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-56 flex-shrink-0 bg-[#0A0F1E] border-r border-white/5 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#2D6FE8] flex items-center justify-center flex-shrink-0">
            <span className="text-white font-black text-xs">F</span>
          </div>
          <span className="text-white font-black text-base tracking-tight">Forj</span>
        </div>
      </div>

      {/* Role badge */}
      {isAdmin && (
        <div className="px-4 pt-4">
          <div className="flex items-center gap-1.5 bg-[#2D6FE8]/10 border border-[#2D6FE8]/20 rounded-md px-2.5 py-1.5">
            <ShieldCheck size={12} className="text-[#2D6FE8]" />
            <span className="text-[#2D6FE8] text-xs font-semibold">Admin</span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 pt-4 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && href !== '/admin' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-[#2D6FE8]/15 text-[#2D6FE8]'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}

        {/* Admin can also see client view */}
        {isAdmin && (
          <>
            <div className="pt-4 pb-1 px-3">
              <span className="text-white/20 text-xs font-semibold uppercase tracking-wider">Client View</span>
            </div>
            {clientNav.map(({ href, label, icon: Icon }) => (
              <Link
                key={`client-${href}`}
                href={href}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  'text-white/30 hover:text-white/60 hover:bg-white/5'
                )}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* User + signout */}
      <div className="px-3 pb-4 border-t border-white/5 pt-3">
        <div className="px-3 py-2 mb-1">
          <p className="text-white/60 text-xs truncate">{user?.email}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-white/40 hover:text-white hover:bg-white/5 transition-colors w-full"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
