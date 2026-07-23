'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Phone, Settings, Users, FileText, LogOut, ShieldCheck, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface AppSidebarProps {
  user: { email?: string } | null
  profile: { role: string } | null
}

const clientNav = [
  { href: '/dashboard', label: 'Leads', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/calls', label: 'All Calls', icon: Phone, exact: false },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, exact: false },
]

const adminNav = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/clients', label: 'Clients', icon: Users, exact: false },
  { href: '/admin/templates', label: 'Templates', icon: FileText, exact: false },
]

function NavItem({ href, label, icon: Icon, active }: { href: string; label: string; icon: React.ElementType; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
        active
          ? 'bg-[#2D6FE8]/15 text-[#4D8BF0]'
          : 'text-white/40 hover:text-white/80 hover:bg-white/5'
      )}
    >
      <Icon size={15} className={active ? 'text-[#4D8BF0]' : ''} />
      {label}
    </Link>
  )
}

export function AppSidebar({ user, profile }: AppSidebarProps) {
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
    <aside className="w-56 flex-shrink-0 bg-[#070C18] border-r border-white/[0.06] flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 h-14 flex items-center border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2D6FE8] to-[#1A4FC0] flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-900/30">
            <Zap size={14} className="text-white" fill="white" />
          </div>
          <span className="text-white font-black text-base tracking-tight">Forj</span>
        </div>
      </div>

      {/* Role badge */}
      {isAdmin && (
        <div className="px-4 pt-4">
          <div className="flex items-center gap-1.5 bg-[#2D6FE8]/10 border border-[#2D6FE8]/20 rounded-md px-2.5 py-1.5 w-fit">
            <ShieldCheck size={11} className="text-[#4D8BF0]" />
            <span className="text-[#4D8BF0] text-xs font-semibold">Admin</span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 pt-4 space-y-0.5 overflow-y-auto">
        <p className="text-white/20 text-[10px] font-semibold uppercase tracking-wider px-3 mb-2">
          {isAdmin ? 'Management' : 'Menu'}
        </p>
        {nav.map(({ href, label, icon, exact }) => (
          <NavItem key={href} href={href} label={label} icon={icon} active={isActive(href, exact)} />
        ))}

        {isAdmin && (
          <>
            <div className="pt-5 pb-1 px-3">
              <p className="text-white/20 text-[10px] font-semibold uppercase tracking-wider">Client View</p>
            </div>
            {clientNav.map(({ href, label, icon, exact }) => (
              <NavItem key={`c-${href}`} href={href} label={label} icon={icon} active={isActive(href, exact)} />
            ))}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 border-t border-white/[0.06] pt-3">
        <div className="px-3 py-2 mb-1">
          <p className="text-white/30 text-xs truncate">{user?.email}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-white/30 hover:text-white/70 hover:bg-white/5 transition-colors w-full"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
