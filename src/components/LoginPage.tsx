import { useState } from 'react'
import { Eye, EyeSlash, Lock, EnvelopeSimple, Spinner } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import w3MediaLogo from '@/assets/images/W3Media-Web-Green.png'
import w3PMSLogo from '@/assets/images/W3-PMS.png'
import type { HotelBranding } from '@/lib/types'

interface LoginPageProps {
  onLogin: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  onForgotPassword: () => void
  branding?: HotelBranding | null
}

export function LoginPage({ onLogin, onForgotPassword, branding }: LoginPageProps) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const primaryColor = branding?.colorScheme?.primary || '#1a56db'
  const hotelName = branding?.hotelName || 'W3 Hotel PMS'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!identifier.trim() || !password) {
      setError('Please enter your username/email and password.')
      return
    }

    setLoading(true)
    try {
      const result = await onLogin(identifier.trim(), password)
      if (!result.success) {
        setError(result.error || 'Invalid credentials. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col w-full" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
      {/* Background luxury overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10 blur-3xl"
          style={{ background: primaryColor }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-10 blur-3xl"
          style={{ background: primaryColor }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative z-10">
        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          {branding?.logo ? (
            <img
              src={branding.logo}
              alt={hotelName}
              className="h-16 mx-auto mb-4 object-contain"
            />
          ) : (
            <img
              src={w3PMSLogo}
              alt="W3 Hotel PMS"
              className="h-14 mx-auto mb-4 object-contain"
            />
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{hotelName}</h1>
          <p className="text-slate-400 mt-1 text-sm">Property Management System</p>
        </div>

        {/* Login Card */}
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/5 backdrop-blur-xl text-white">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-white">Welcome back</h2>
              <p className="text-slate-400 text-sm mt-1">Sign in to your account to continue</p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username / Email */}
              <div className="space-y-1.5">
                <Label htmlFor="identifier" className="text-slate-300 text-sm font-medium">
                  Username or Email
                </Label>
                <div className="relative">
                  <EnvelopeSimple
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <Input
                    id="identifier"
                    type="text"
                    autoComplete="username"
                    placeholder="Enter your username or email"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    disabled={loading}
                    className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-slate-500 focus:border-blue-400 focus:ring-blue-400/30"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-slate-300 text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={loading}
                    className="pl-9 pr-10 bg-white/10 border-white/20 text-white placeholder:text-slate-500 focus:border-blue-400 focus:ring-blue-400/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors underline-offset-4 hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 font-semibold text-base transition-all"
                style={{ background: primaryColor }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Spinner size={16} className="animate-spin" />
                    Signing in…
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Support */}
            <p className="text-center text-xs text-slate-500">
              Need help?{' '}
              <a
                href="mailto:support@w3media.lk"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Contact Support
              </a>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-4 px-6 border-t border-white/10">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-center">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} {hotelName}. All Rights Reserved.
          </p>
          <span className="hidden sm:inline text-slate-600">·</span>
          <span className="text-xs text-slate-500">Developed by</span>
          <a
            href="https://www.w3media.lk/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <img src={w3MediaLogo} alt="W3 Media" className="h-4 object-contain" />
          </a>
        </div>
      </footer>
    </div>
  )
}
