'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Zap } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  const inputClass = "bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#2D6FE8] focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"

  return (
    <div className="min-h-screen bg-[#060B16] flex items-center justify-center px-4">
      {/* subtle grid bg */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(45,111,232,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(45,111,232,0.03)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-7">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2D6FE8] to-[#1A4FC0] flex items-center justify-center shadow-lg shadow-blue-900/40">
              <Zap size={16} className="text-white" fill="white" />
            </div>
            <span className="text-white font-black text-xl tracking-tight">Forj</span>
          </div>
          <h1 className="text-white text-2xl font-bold mb-1.5">Welcome back</h1>
          <p className="text-white/35 text-sm">Sign in to your dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-[#0D1525] border border-white/[0.08] rounded-2xl p-8 shadow-2xl shadow-black/40">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-white/50 text-xs font-medium" htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-white/50 text-xs font-medium" htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-400/8 border border-red-400/20 rounded-lg px-3 py-2.5">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2D6FE8] hover:bg-[#4D8BF0] text-white font-semibold h-11 transition-colors mt-1"
            >
              {loading ? 'Signing in…' : 'Sign in →'}
            </Button>
          </form>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          Need access? Contact james@forjahead.com
        </p>
      </div>
    </div>
  )
}
