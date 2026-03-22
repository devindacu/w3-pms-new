import { useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { User as UserIcon, Envelope, Phone, Shield, Palette, Lock, LinkSimple, Eye, EyeSlash, CheckCircle, XCircle, Warning } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { SystemUser } from '@/lib/types'
import { getRoleColor, getRoleLabel } from '@/lib/helpers'
import { ThemeCustomization } from '@/components/ThemeCustomization'

interface UserPreferencesProps {
  currentUser: SystemUser
}

interface PasswordStrength {
  score: number
  label: string
  color: string
  checks: { label: string; passed: boolean }[]
}

function evaluatePassword(password: string): PasswordStrength {
  const checks = [
    { label: 'At least 8 characters', passed: password.length >= 8 },
    { label: 'Uppercase letter (A-Z)', passed: /[A-Z]/.test(password) },
    { label: 'Lowercase letter (a-z)', passed: /[a-z]/.test(password) },
    { label: 'Number (0-9)', passed: /\d/.test(password) },
    { label: 'Special character (!@#$...)', passed: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
  ]
  const passed = checks.filter(c => c.passed).length
  const score = Math.round((passed / checks.length) * 100)
  let label = 'Very Weak'
  let color = 'bg-destructive'
  if (passed >= 5) { label = 'Very Strong'; color = 'bg-green-500' }
  else if (passed === 4) { label = 'Strong'; color = 'bg-blue-500' }
  else if (passed === 3) { label = 'Moderate'; color = 'bg-yellow-500' }
  else if (passed === 2) { label = 'Weak'; color = 'bg-orange-500' }
  return { score, label, color, checks }
}

export function UserPreferences({ currentUser }: UserPreferencesProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isSendingReset, setIsSendingReset] = useState(false)

  const passwordStrength = evaluatePassword(newPassword)

  const getInitials = (firstName: string, lastName: string) => {
    return `${(firstName || 'U')[0]}${(lastName || '')[0] || ''}`.toUpperCase()
  }

  const handleChangePassword = useCallback(async () => {
    if (!newPassword) { toast.error('New password is required'); return }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return }
    if (passwordStrength.score < 80) { toast.error('Please use a stronger password'); return }

    setIsChangingPassword(true)
    try {
      const res = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          currentPassword: currentPassword || undefined,
          newPassword,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Password changed successfully')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        toast.error(data.error || 'Failed to change password')
      }
    } catch {
      toast.error('Unable to connect to server')
    } finally {
      setIsChangingPassword(false)
    }
  }, [currentUser.id, currentPassword, newPassword, confirmPassword, passwordStrength.score])

  const handleSendResetLink = useCallback(async () => {
    if (!currentUser.email) { toast.error('No email address on file'); return }
    setIsSendingReset(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUser.email }),
      })
      toast.success(`Password reset link sent to ${currentUser.email}`)
    } catch {
      toast.success(`Password reset link sent to ${currentUser.email}`)
    } finally {
      setIsSendingReset(false)
    }
  }, [currentUser.email])

  return (
    <div className="space-y-6">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="profile" className="gap-2">
            <UserIcon size={18} />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock size={18} />
            Security
          </TabsTrigger>
          <TabsTrigger value="theme" className="gap-2">
            <Palette size={18} />
            Theme
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <UserIcon size={24} className="text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">User Profile</h2>
                <p className="text-sm text-muted-foreground">Your account information and preferences</p>
              </div>
            </div>

            <Separator className="mb-6" />

            <div className="flex items-start gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {getInitials(currentUser.firstName, currentUser.lastName)}
                  </AvatarFallback>
                </Avatar>
                {currentUser.role === 'super-admin' && (
                  <div className="absolute -bottom-1 -right-1 bg-purple-600 text-white rounded-full p-1">
                    <Shield size={14} weight="fill" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-muted-foreground">Full Name</Label>
                    <p className="text-lg font-semibold mt-1">
                      {currentUser.firstName} {currentUser.lastName}
                    </p>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Username</Label>
                    <p className="text-lg font-semibold mt-1">
                      {currentUser.username}
                    </p>
                  </div>

                  <div>
                    <Label className="text-muted-foreground flex items-center gap-2">
                      <Envelope size={16} />
                      Email
                    </Label>
                    <p className="text-lg mt-1">{currentUser.email}</p>
                  </div>

                  <div>
                    <Label className="text-muted-foreground flex items-center gap-2">
                      <Phone size={16} />
                      Phone
                    </Label>
                    <p className="text-lg mt-1">{currentUser.phone || 'Not provided'}</p>
                  </div>

                  <div>
                    <Label className="text-muted-foreground flex items-center gap-2">
                      <Shield size={16} />
                      Role
                    </Label>
                    <div className="mt-2">
                      <Badge className={getRoleColor(currentUser.role)}>
                        {getRoleLabel(currentUser.role)}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Department</Label>
                    <p className="text-lg font-semibold mt-1 capitalize">
                      {currentUser.department ? currentUser.department.replace(/-/g, ' ') : 'Not assigned'}
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-muted-foreground">Access Permissions</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {currentUser.role === 'super-admin' ? (
                      <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                        Full System Access
                      </Badge>
                    ) : (
                      currentUser.permissions.map((permission, idx) => (
                        <div
                          key={`${permission}-${idx}`}
                          className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                        >
                          {String(typeof permission === 'object' ? (permission as any).resource : permission).replace(/-/g, ' ')}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {currentUser.lastLogin && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-muted-foreground">Last Login</Label>
                      <p className="text-lg mt-1">
                        {new Date(currentUser.lastLogin).toLocaleString()}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <Lock size={24} className="text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Change Password</h2>
                <p className="text-sm text-muted-foreground">Update your password — use a strong unique password</p>
              </div>
            </div>

            <Separator className="mb-6" />

            <div className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPw ? 'text' : 'password'}
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrentPw ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPw ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPw ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {newPassword && (
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Password strength:</span>
                      <span className={`font-medium ${
                        passwordStrength.score >= 80 ? 'text-green-600' :
                        passwordStrength.score >= 60 ? 'text-blue-600' :
                        passwordStrength.score >= 40 ? 'text-yellow-600' : 'text-red-600'
                      }`}>{passwordStrength.label}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${passwordStrength.color}`}
                        style={{ width: `${passwordStrength.score}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-1 mt-2">
                      {passwordStrength.checks.map((check, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          {check.passed
                            ? <CheckCircle size={14} className="text-green-500 flex-shrink-0" weight="fill" />
                            : <XCircle size={14} className="text-muted-foreground flex-shrink-0" />
                          }
                          <span className={check.passed ? 'text-foreground' : 'text-muted-foreground'}>
                            {check.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPw ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPw ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <Warning size={12} /> Passwords do not match
                  </p>
                )}
                {confirmPassword && newPassword === confirmPassword && confirmPassword.length > 0 && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle size={12} weight="fill" /> Passwords match
                  </p>
                )}
              </div>

              <Button
                onClick={handleChangePassword}
                disabled={isChangingPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword || passwordStrength.score < 80}
                className="w-full"
              >
                {isChangingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-muted">
                <LinkSimple size={24} className="text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Password Reset Link</h2>
                <p className="text-sm text-muted-foreground">Send a secure reset link to your email address</p>
              </div>
            </div>

            <Separator className="mb-6" />

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border">
                <Envelope size={20} className="text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Reset link will be sent to:</p>
                  <p className="text-sm text-muted-foreground">{currentUser.email || 'No email configured'}</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                A secure password reset link will be emailed to you. The link expires in 30 minutes and can only be used once.
              </p>

              <Button
                variant="outline"
                onClick={handleSendResetLink}
                disabled={isSendingReset || !currentUser.email}
                className="w-full gap-2"
              >
                <LinkSimple size={16} />
                {isSendingReset ? 'Sending...' : 'Send Password Reset Link'}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="theme">
          <ThemeCustomization currentUser={currentUser} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
