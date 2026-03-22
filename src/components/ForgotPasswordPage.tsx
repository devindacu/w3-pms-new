import { useState } from 'react'
import { ArrowLeft, EnvelopeSimple, Spinner, CheckCircle } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import w3MediaLogo from '@/assets/images/W3Media-Web-Green.png'
import w3PMSLogo from '@/assets/images/W3-PMS.png'
import type { HotelBranding } from '@/lib/types'

interface ForgotPasswordPageProps {
  onBack: () => void
  onSubmit: (email: string) => Promise<{ success: boolean; error?: string }>
  branding?: HotelBranding | null
}

export function ForgotPasswordPage({ onBack, onSubmit, branding }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const primaryColor = branding?.colorScheme?.primary || '#1a56db'
  const hotelName = branding?.hotelName || 'W3 Hotel PMS'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    try {
      const result = await onSubmit(email.trim())
      if (result.success) {
        setSuccess(true)
      } else {
        setError(result.error || 'Failed to send reset email. Please try again.')
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

        {/* Reset Card */}
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/5 backdrop-blur-xl text-white">
          <CardContent className="p-6 sm:p-8 space-y-6">
            {success ? (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <CheckCircle size={48} className="text-green-400" weight="fill" />
                </div>
                <h2 className="text-xl font-semibold text-white">Check your email</h2>
                <p className="text-slate-400 text-sm">
                  If an account with <span className="text-white font-medium">{email}</span> exists,
                  we've sent password reset instructions. The link expires in 30 minutes.
                </p>
                <Button
                  onClick={onBack}
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10"
                >
                  Back to Sign In
                </Button>
              </div>
            ) : (
              <>
                <div>
                  <button
                    type="button"
                    onClick={onBack}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors text-sm mb-4"
                  >
                    <ArrowLeft size={14} />
                    Back to Sign In
                  </button>
                  <h2 className="text-xl font-semibold text-white">Reset your password</h2>
                  <p className="text-slate-400 text-sm mt-1">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                </div>

                {error && (
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="reset-email" className="text-slate-300 text-sm font-medium">
                      Email Address
                    </Label>
                    <div className="relative">
                      <EnvelopeSimple
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      />
                      <Input
                        id="reset-email"
                        type="email"
                        autoComplete="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        disabled={loading}
                        className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-slate-500 focus:border-blue-400 focus:ring-blue-400/30"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 font-semibold text-base transition-all"
                    style={{ background: primaryColor }}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Spinner size={16} className="animate-spin" />
                        Sending…
                      </span>
                    ) : (
                      'Send Reset Link'
                    )}
                  </Button>
                </form>
              </>
            )}
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
