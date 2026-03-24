import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { type SystemUser, type SystemRole, type Department, type ActivityLog } from '@/lib/types'
import { generateId, generateNumber, getRolePermissions, createActivityLog } from '@/lib/helpers'
import {
  Eye,
  EyeSlash,
  ArrowsClockwise,
  Key,
  EnvelopeSimple,
  ShieldCheck,
  Spinner,
} from '@phosphor-icons/react'

/** Generate a strong random password with upper, lower, numbers and symbols. */
/**
 * Return a random integer in [0, max) using rejection sampling to avoid
 * modulo bias — the standard technique for cryptographically-strong picks.
 */
function secureRandom(max: number): number {
  const limit = 256 - (256 % max) // largest multiple of max that fits in a byte
  let byte: number
  do {
    byte = crypto.getRandomValues(new Uint8Array(1))[0]
  } while (byte >= limit)
  return byte % max
}

function generateStrongPassword(length = 14): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lower = 'abcdefghjkmnpqrstuvwxyz'
  const digits = '23456789'
  const symbols = '!@#$%^&*'
  const all = upper + lower + digits + symbols
  // Guarantee at least one character from each category
  const must = [
    upper[secureRandom(upper.length)],
    lower[secureRandom(lower.length)],
    digits[secureRandom(digits.length)],
    symbols[secureRandom(symbols.length)],
  ]
  const rest = Array.from({ length: length - must.length }, () => all[secureRandom(all.length)])
  // Shuffle using Fisher-Yates with secure random for unbiased ordering
  const combined = [...must, ...rest]
  for (let i = combined.length - 1; i > 0; i--) {
    const j = secureRandom(i + 1)
    ;[combined[i], combined[j]] = [combined[j], combined[i]]
  }
  return combined.join('')
}

interface UserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: SystemUser | null
  users: SystemUser[]
  setUsers: (users: SystemUser[] | ((prev: SystemUser[]) => SystemUser[])) => void
  currentUser: SystemUser
  activityLogs: ActivityLog[]
  setActivityLogs: (logs: ActivityLog[] | ((prev: ActivityLog[]) => ActivityLog[])) => void
}

export function UserDialog({ open, onOpenChange, user, users, setUsers, currentUser, activityLogs, setActivityLogs }: UserDialogProps) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'user-requester' as SystemRole,
    department: '' as Department | '',
    isActive: true,
  })

  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [sendCredentials, setSendCredentials] = useState(false)
  const [mustChangePassword, setMustChangePassword] = useState(true)
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  const resetPasswordSection = useCallback(() => {
    setPassword('')
    setShowPassword(false)
    setSendCredentials(false)
    setMustChangePassword(true)
  }, [])

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || '',
        role: user.role,
        department: user.department || '',
        isActive: user.isActive,
      })
      resetPasswordSection()
    } else {
      setFormData({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: 'user-requester',
        department: '',
        isActive: true,
      })
      resetPasswordSection()
    }
  }, [user, open, resetPasswordSection])

  const handleGeneratePassword = () => {
    const pwd = generateStrongPassword()
    setPassword(pwd)
    setShowPassword(true)
    toast.success('Strong password generated')
  }

  const syncUserToAuthDb = async (id: string, userData: Partial<SystemUser>) => {
    try {
      const token = localStorage.getItem('w3-auth-token')
      await fetch('/api/auth/upsert-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          id,
          username: userData.username,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          isActive: userData.isActive,
          ...(password ? { password } : {}),
        }),
      })
    } catch {
      // Non-critical — user still saved in UI store
    }
  }

  const sendCredentialsEmail = async (userData: {
    firstName: string
    email: string
    username: string
    password: string
  }) => {
    setIsSendingEmail(true)
    try {
      const loginUrl = window.location.origin + '/login'
      const html = `
        <div style="font-family:sans-serif;max-width:520px;margin:auto;">
          <h2 style="color:#1d4ed8;">Your PMS Account Access</h2>
          <p>Hello <strong>${userData.firstName}</strong>,</p>
          <p>Your account has been created on the Hotel PMS system.</p>
          <table style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;background:#f9fafb;width:100%;">
            <tr><td style="padding:4px 0;color:#6b7280;">Login URL</td><td><a href="${loginUrl}">${loginUrl}</a></td></tr>
            <tr><td style="padding:4px 0;color:#6b7280;">Username</td><td><strong>${userData.username}</strong></td></tr>
            <tr><td style="padding:4px 0;color:#6b7280;">Password</td><td><code style="background:#e5e7eb;padding:2px 6px;border-radius:4px;">${userData.password}</code></td></tr>
          </table>
          <p style="color:#dc2626;font-size:13px;margin-top:16px;">⚠️ Please change your password after your first login.</p>
          <p style="color:#6b7280;font-size:12px;">Regards,<br/>Admin Team</p>
        </div>`
      const text = `Hello ${userData.firstName},\n\nYour PMS account has been created.\n\nLogin URL: ${loginUrl}\nUsername: ${userData.username}\nPassword: ${userData.password}\n\nPlease change your password after first login.\n\nRegards,\nAdmin Team`

      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: userData.email,
          subject: 'Your PMS Account Access',
          html,
          text,
        }),
      })
      if (res.ok) {
        toast.success(`Login credentials sent to ${userData.email}`)
      } else {
        toast.warning('User saved but email could not be sent. Check SMTP settings.')
      }
    } catch {
      toast.warning('User saved but email could not be sent. Check SMTP settings.')
    } finally {
      setIsSendingEmail(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.username.trim()) {
      toast.error('Username is required')
      return
    }
    if (!formData.email.trim()) {
      toast.error('Email is required')
      return
    }
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error('First name and last name are required')
      return
    }

    const usernameExists = users.some(u => u.username === formData.username && u.id !== user?.id)
    if (usernameExists) {
      toast.error('Username already exists')
      return
    }
    const emailExists = users.some(u => u.email === formData.email && u.id !== user?.id)
    if (emailExists) {
      toast.error('Email already exists')
      return
    }

    if (user) {
      const oldRole = user.role
      const newUser: SystemUser = {
        ...user,
        ...formData,
        department: formData.department || undefined,
        permissions: formData.role !== oldRole ? getRolePermissions(formData.role) : user.permissions,
        mustChangePassword: mustChangePassword || user.mustChangePassword,
        updatedAt: Date.now(),
      }

      setUsers(prev => prev.map(u => u.id === user.id ? newUser : u))
      await syncUserToAuthDb(user.id, newUser)

      const log = createActivityLog(
        currentUser,
        'user-updated',
        `Updated user ${formData.username}`,
        `Modified user profile${oldRole !== formData.role ? ` and changed role from ${oldRole} to ${formData.role}` : ''}`,
        'users',
        user.id,
        { oldRole, newRole: formData.role }
      )
      setActivityLogs(prev => [log, ...prev])
      toast.success('User updated successfully')

      if (sendCredentials && password) {
        await sendCredentialsEmail({ firstName: formData.firstName, email: formData.email, username: formData.username, password })
      }
    } else {
      const newUser: SystemUser = {
        id: generateId(),
        userId: generateNumber('USR'),
        ...formData,
        department: formData.department || undefined,
        permissions: getRolePermissions(formData.role),
        mustChangePassword,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: currentUser.id,
      }

      setUsers(prev => [newUser, ...prev])
      await syncUserToAuthDb(newUser.id, newUser)

      const log = createActivityLog(
        currentUser,
        'user-created',
        `Created new user ${formData.username}`,
        `Added user with role ${formData.role}`,
        'users',
        newUser.id,
        { role: formData.role }
      )
      setActivityLogs(prev => [log, ...prev])
      toast.success('User created successfully')

      if (sendCredentials && password) {
        await sendCredentialsEmail({ firstName: formData.firstName, email: formData.email, username: formData.username, password })
      }
    }

    onOpenChange(false)
  }

  const isNewUser = !user

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNewUser ? 'Add New User' : 'Edit User'}</DialogTitle>
          <DialogDescription>
            {isNewUser
              ? 'Create a new user account with role-based permissions'
              : 'Update user information and role'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Doe"
                />
              </div>
            </div>

            {/* Username & Email */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="johndoe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john.doe@example.com"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 234 567 8900"
              />
            </div>

            {/* Role & Department */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">User Role / Type *</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as SystemRole })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentUser.role === 'super-admin' && (
                      <SelectItem value="super-admin">
                        <span className="flex items-center gap-2">
                          <span className="inline-block w-2 h-2 rounded-full bg-purple-500" />
                          Super Administrator
                        </span>
                      </SelectItem>
                    )}
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="reservation">Reservation ✅</SelectItem>
                    <SelectItem value="procurement-manager">Procurement Manager</SelectItem>
                    <SelectItem value="department-head">Department Head</SelectItem>
                    <SelectItem value="storekeeper">Storekeeper</SelectItem>
                    <SelectItem value="accounts">Accounts</SelectItem>
                    <SelectItem value="user-requester">User/Requester</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select value={formData.department || 'none'} onValueChange={(value) => setFormData({ ...formData, department: value === 'none' ? '' : value as Department })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="front-office">Front Office</SelectItem>
                    <SelectItem value="housekeeping">Housekeeping</SelectItem>
                    <SelectItem value="fnb">F&B</SelectItem>
                    <SelectItem value="kitchen">Kitchen</SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">Active Account</Label>
            </div>

            <Separator />

            {/* Password Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Key size={16} className="text-muted-foreground" />
                <Label className="text-base font-semibold">Password</Label>
                {isNewUser && <span className="text-xs text-muted-foreground">(required for new users)</span>}
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isNewUser ? 'Enter or generate password…' : 'Leave blank to keep existing password'}
                    className="pr-10 font-mono"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(v => !v)}
                  >
                    {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={handleGeneratePassword} className="gap-1.5 shrink-0">
                  <ArrowsClockwise size={14} />
                  Generate
                </Button>
              </div>

              {password && (
                <p className="text-xs text-muted-foreground">
                  Password strength: {password.length >= 12 ? '✅ Strong' : '⚠️ Consider using at least 12 characters'}
                </p>
              )}

              {/* Security Options */}
              <div className="space-y-2 pl-1">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="mustChangePassword"
                    checked={mustChangePassword}
                    onCheckedChange={(v) => setMustChangePassword(Boolean(v))}
                  />
                  <label htmlFor="mustChangePassword" className="text-sm cursor-pointer flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-amber-500" />
                    Force password change on first login
                  </label>
                </div>

                {password && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="sendCredentials"
                      checked={sendCredentials}
                      onCheckedChange={(v) => setSendCredentials(Boolean(v))}
                    />
                    <label htmlFor="sendCredentials" className="text-sm cursor-pointer flex items-center gap-1.5">
                      <EnvelopeSimple size={14} className="text-blue-500" />
                      Send login credentials to user email ({formData.email || 'enter email above'})
                    </label>
                  </div>
                )}
              </div>

              {sendCredentials && password && formData.email && (
                <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/20">
                  <AlertDescription className="text-xs text-blue-700 dark:text-blue-300">
                    An email will be sent to <strong>{formData.email}</strong> with the subject
                    <em> "Your PMS Account Access"</em> containing the login URL, username, and the generated password.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSendingEmail} className="gap-2">
              {isSendingEmail && <Spinner size={14} className="animate-spin" />}
              {isNewUser ? 'Create User' : 'Update User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

