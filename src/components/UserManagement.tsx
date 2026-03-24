import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  MagnifyingGlass,
  User,
  PencilSimple,
  Trash,
  UserGear,
  ClockCounterClockwise,
  Check,
  X,
  DotsThreeVertical,
  LockKey,
  EnvelopeSimple,
  Prohibit,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { type SystemUser, type SystemRole, type Department, type ActivityLog } from '@/lib/types'
import {
  formatDateTime,
  getRoleColor,
  getRoleLabel,
  searchUsers,
  filterUsersByRole,
  filterUsersByStatus,
  filterUsersByDepartment,
} from '@/lib/helpers'
import { UserDialog } from './UserDialog'
import { UserPermissionsDialog } from './UserPermissionsDialog'
import { ActivityLogsDialog } from './ActivityLogsDialog'

interface UserManagementProps {
  users: SystemUser[]
  setUsers: (users: SystemUser[] | ((prev: SystemUser[]) => SystemUser[])) => void
  currentUser: SystemUser
  activityLogs: ActivityLog[]
  setActivityLogs: (logs: ActivityLog[] | ((prev: ActivityLog[]) => ActivityLog[])) => void
}

/** Return a random integer in [0, max) using rejection sampling to avoid modulo bias. */
function secureRandom(max: number): number {
  const limit = 256 - (256 % max)
  let byte: number
  do { byte = crypto.getRandomValues(new Uint8Array(1))[0] } while (byte >= limit)
  return byte % max
}

/** Generate a strong random password with uppercase, lowercase, digits and symbols. */
function generateStrongPassword(length = 14): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lower = 'abcdefghjkmnpqrstuvwxyz'
  const digits = '23456789'
  const symbols = '!@#$%^&*'
  const all = upper + lower + digits + symbols
  const must = [upper[secureRandom(upper.length)], lower[secureRandom(lower.length)], digits[secureRandom(digits.length)], symbols[secureRandom(symbols.length)]]
  const rest = Array.from({ length: length - must.length }, () => all[secureRandom(all.length)])
  const combined = [...must, ...rest]
  for (let i = combined.length - 1; i > 0; i--) {
    const j = secureRandom(i + 1)
    ;[combined[i], combined[j]] = [combined[j], combined[i]]
  }
  return combined.join('')
}

export function UserManagement({ users, setUsers, currentUser, activityLogs, setActivityLogs }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<SystemRole | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [departmentFilter, setDepartmentFilter] = useState<Department | 'all'>('all')
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false)
  const [isActivityLogsOpen, setIsActivityLogsOpen] = useState(false)
  const [viewingUser, setViewingUser] = useState<SystemUser | null>(null)

  const filteredUsers = users
    .filter(user => {
      let matches = true
      if (searchTerm) matches = matches && searchUsers([user], searchTerm).length > 0
      if (roleFilter !== 'all') matches = matches && filterUsersByRole([user], roleFilter).length > 0
      if (statusFilter !== 'all') matches = matches && filterUsersByStatus([user], statusFilter === 'active').length > 0
      if (departmentFilter !== 'all') matches = matches && filterUsersByDepartment([user], departmentFilter).length > 0
      return matches
    })
    .sort((a, b) => b.createdAt - a.createdAt)

  const handleAddUser = () => { setSelectedUser(null); setIsDialogOpen(true) }
  const handleEditUser = (user: SystemUser) => { setSelectedUser(user); setIsDialogOpen(true) }
  const handleManagePermissions = (user: SystemUser) => { setSelectedUser(user); setIsPermissionsDialogOpen(true) }
  const handleViewActivity = (user: SystemUser) => { setViewingUser(user); setIsActivityLogsOpen(true) }

  const handleDeleteUser = (user: SystemUser) => {
    if (user.id === currentUser.id) { toast.error('Cannot delete your own account'); return }
    if (!confirm(`Are you sure you want to delete ${user.username}?`)) return
    setUsers(prev => prev.filter(u => u.id !== user.id))
    toast.success('User deleted successfully')
  }

  const handleToggleStatus = (user: SystemUser) => {
    if (user.id === currentUser.id) { toast.error('Cannot deactivate your own account'); return }
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: !u.isActive, updatedAt: Date.now() } : u))
    toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`)
  }

  const handleResetPassword = async (user: SystemUser) => {
    if (!confirm(`Reset password for ${user.username}? A new password will be generated and sent to ${user.email}.`)) return
    const newPassword = generateStrongPassword()
    // Update password via auth endpoint
    try {
      const token = localStorage.getItem('w3-auth-token')
      await fetch('/api/auth/upsert-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ id: user.id, username: user.username, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, isActive: user.isActive, password: newPassword }),
      })
    } catch { /* non-critical */ }

    // Mark mustChangePassword = true
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, mustChangePassword: true, updatedAt: Date.now() } : u))

    // Send new credentials email
    try {
      const loginUrl = window.location.origin + '/login'
      const html = `<div style="font-family:sans-serif;max-width:520px;margin:auto;"><h2 style="color:#1d4ed8;">Password Reset</h2><p>Hello <strong>${user.firstName}</strong>,</p><p>Your PMS account password has been reset by an administrator.</p><table style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;background:#f9fafb;width:100%;"><tr><td style="padding:4px 0;color:#6b7280;">Login URL</td><td><a href="${loginUrl}">${loginUrl}</a></td></tr><tr><td style="padding:4px 0;color:#6b7280;">Username</td><td><strong>${user.username}</strong></td></tr><tr><td style="padding:4px 0;color:#6b7280;">New Password</td><td><code style="background:#e5e7eb;padding:2px 6px;border-radius:4px;">${newPassword}</code></td></tr></table><p style="color:#dc2626;font-size:13px;margin-top:16px;">⚠️ Please change your password after logging in.</p><p style="color:#6b7280;font-size:12px;">Regards,<br/>Admin Team</p></div>`
      await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: user.email, subject: 'Your PMS Password Has Been Reset', html }),
      })
      toast.success(`Password reset. New credentials sent to ${user.email}`)
    } catch {
      toast.warning('Password reset but email could not be sent. Check SMTP settings.')
    }
  }

  const handleResendCredentials = async (user: SystemUser) => {
    const newPassword = generateStrongPassword()
    try {
      const token = localStorage.getItem('w3-auth-token')
      await fetch('/api/auth/upsert-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ id: user.id, username: user.username, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, isActive: user.isActive, password: newPassword }),
      })
    } catch { /* non-critical */ }

    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, mustChangePassword: true, updatedAt: Date.now() } : u))

    try {
      const loginUrl = window.location.origin + '/login'
      const html = `<div style="font-family:sans-serif;max-width:520px;margin:auto;"><h2 style="color:#1d4ed8;">Your PMS Account Access</h2><p>Hello <strong>${user.firstName}</strong>,</p><p>Your login credentials for the Hotel PMS system have been resent.</p><table style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;background:#f9fafb;width:100%;"><tr><td style="padding:4px 0;color:#6b7280;">Login URL</td><td><a href="${loginUrl}">${loginUrl}</a></td></tr><tr><td style="padding:4px 0;color:#6b7280;">Username</td><td><strong>${user.username}</strong></td></tr><tr><td style="padding:4px 0;color:#6b7280;">Password</td><td><code style="background:#e5e7eb;padding:2px 6px;border-radius:4px;">${newPassword}</code></td></tr></table><p style="color:#dc2626;font-size:13px;margin-top:16px;">⚠️ Please change your password after logging in.</p><p style="color:#6b7280;font-size:12px;">Regards,<br/>Admin Team</p></div>`
      await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: user.email, subject: 'Your PMS Account Access', html }),
      })
      toast.success(`Credentials resent to ${user.email}`)
    } catch {
      toast.warning('Could not send email. Check SMTP settings.')
    }
  }

  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length,
    admins: users.filter(u => u.role === 'admin' || u.role === 'super-admin').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage system users, roles, and permissions</p>
        </div>
        <Button onClick={handleAddUser} size="lg">
          <Plus size={20} className="mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.total, icon: <User size={28} className="text-primary" /> },
          { label: 'Active Users', value: stats.active, icon: <Check size={28} className="text-green-500" /> },
          { label: 'Inactive Users', value: stats.inactive, icon: <X size={28} className="text-destructive" /> },
          { label: 'Administrators', value: stats.admins, icon: <UserGear size={28} className="text-accent" /> },
        ].map(stat => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-semibold mt-1">{stat.value}</p>
              </div>
              {stat.icon}
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <MagnifyingGlass size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, username, email, or ID…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as SystemRole | 'all')}>
            <SelectTrigger className="w-full md:w-52">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="super-admin">Super Administrator</SelectItem>
              <SelectItem value="admin">Administrator</SelectItem>
              <SelectItem value="reservation">Reservation</SelectItem>
              <SelectItem value="procurement-manager">Procurement Manager</SelectItem>
              <SelectItem value="department-head">Department Head</SelectItem>
              <SelectItem value="storekeeper">Storekeeper</SelectItem>
              <SelectItem value="accounts">Accounts</SelectItem>
              <SelectItem value="user-requester">User/Requester</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | 'active' | 'inactive')}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select value={departmentFilter} onValueChange={(v) => setDepartmentFilter(v as Department | 'all')}>
            <SelectTrigger className="w-full md:w-44">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
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

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.firstName} {user.lastName}</p>
                        {user.mustChangePassword && (
                          <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 rounded px-1">must change pwd</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">@{user.username}</TableCell>
                    <TableCell>
                      <Badge className={`${getRoleColor(user.role)} border text-xs`} variant="outline">
                        {getRoleLabel(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? 'default' : 'secondary'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.lastLogin ? formatDateTime(user.lastLogin) : 'Never'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {/* Quick inline actions */}
                        <Button size="sm" variant="ghost" onClick={() => handleEditUser(user)} title="Edit">
                          <PencilSimple size={15} />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleManagePermissions(user)} title="Manage Permissions">
                          <UserGear size={15} />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleViewActivity(user)} title="Activity Log">
                          <ClockCounterClockwise size={15} />
                        </Button>

                        {/* More actions dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost" title="More actions">
                              <DotsThreeVertical size={15} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleResetPassword(user)}
                              disabled={user.id === currentUser.id}
                              className="gap-2"
                            >
                              <LockKey size={14} />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleResendCredentials(user)}
                              className="gap-2"
                            >
                              <EnvelopeSimple size={14} />
                              Resend Credentials
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(user)}
                              disabled={user.id === currentUser.id}
                              className="gap-2"
                            >
                              <Prohibit size={14} />
                              {user.isActive ? 'Disable User' : 'Enable User'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteUser(user)}
                              disabled={user.id === currentUser.id}
                              className="gap-2 text-destructive focus:text-destructive"
                            >
                              <Trash size={14} />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <UserDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        user={selectedUser}
        users={users}
        setUsers={setUsers}
        currentUser={currentUser}
        activityLogs={activityLogs}
        setActivityLogs={setActivityLogs}
      />

      <UserPermissionsDialog
        open={isPermissionsDialogOpen}
        onOpenChange={setIsPermissionsDialogOpen}
        user={selectedUser}
        setUsers={setUsers}
        currentUser={currentUser}
        activityLogs={activityLogs}
        setActivityLogs={setActivityLogs}
      />

      <ActivityLogsDialog
        open={isActivityLogsOpen}
        onOpenChange={setIsActivityLogsOpen}
        user={viewingUser}
        activityLogs={activityLogs}
      />
    </div>
  )
}
