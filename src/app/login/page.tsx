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
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else { router.push('/dashboard'); router.refresh() }
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-4">
      <div className="w-full max-w-[340px]">
        {/* Logo mark */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-7 h-7 rounded-md bg-blue-500 flex items-center justify-center">
              <Zap size={14} className="text-white" fill="white" />
            </div>
            <span className="text-white font-semibold text-sm">Forj</span>
          </div>
          <h1 className="text-xl font-semibold text-white mb-1">Sign in</h1>
          <p className="text-slate-400 text-sm">Enter your credentials to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-slate-400 text-xs" htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-slate-500 focus:border-white/20 focus-visible:ring-0 focus-visible:ring-offset-0 h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-400 text-xs" htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={show ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-slate-500 focus:border-white/20 focus-visible:ring-0 focus-visible:ring-offset-0 h-9 text-sm pr-9"
              />
              <button
                type="button"
                onClick={() => setShow(v => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400 transition-colors"
                tabIndex={-1}
              >
                {show ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-xs bg-red-500/8 border border-red-500/15 rounded-md px-3 py-2.5">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-9 bg-white hover:bg-slate-100 text-black font-medium text-sm transition-colors"
          >
            {loading ? 'Signing in…' : 'Continue'}
          </Button>
        </form>

        <p className="text-slate-500 text-xs mt-6 text-center">
          Need access? <a href="mailto:james@forjahead.com" className="text-slate-400 hover:text-slate-300 transition-colors">Contact james@forjahead.com</a>
        </p>
      </div>
    </div>
  )
}
