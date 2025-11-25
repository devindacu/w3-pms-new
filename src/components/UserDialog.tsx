import { useState, useEffect } from 'react'
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
import { toast } from 'sonner'
import { type SystemUser, type SystemRole, type Department, type ActivityLog } from '@/lib/types'
import { generateId, generateNumber, getRolePermissions, createActivityLog } from '@/lib/helpers'

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
    isActive: true
  })

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
        isActive: user.isActive
      })
    } else {
      setFormData({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: 'user-requester',
        department: '',
        isActive: true
      })
    }
  }, [user, open])

  const handleSubmit = (e: React.FormEvent) => {
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
        updatedAt: Date.now()
      }

      setUsers(prev => prev.map(u => u.id === user.id ? newUser : u))
      
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
    } else {
      const newUser: SystemUser = {
        id: generateId(),
        userId: generateNumber('USR'),
        ...formData,
        department: formData.department || undefined,
        permissions: getRolePermissions(formData.role),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: currentUser.id
      }

      setUsers(prev => [newUser, ...prev])
      
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
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{user ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogDescription>
            {user ? 'Update user information and role' : 'Create a new user account with role-based permissions'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
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
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john.doe@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 234 567 8900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as SystemRole })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
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

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">Active Account</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {user ? 'Update User' : 'Create User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
