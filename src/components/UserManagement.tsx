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
  Plus,
  MagnifyingGlass,
  User,
  PencilSimple,
  Trash,
  Eye,
  UserGear,
  ClockCounterClockwise,
  Check,
  X
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
  filterUsersByDepartment
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
      
      if (searchTerm) {
        const searched = searchUsers([user], searchTerm)
        matches = matches && searched.length > 0
      }
      
      if (roleFilter !== 'all') {
        const filtered = filterUsersByRole([user], roleFilter)
        matches = matches && filtered.length > 0
      }
      
      if (statusFilter !== 'all') {
        const filtered = filterUsersByStatus([user], statusFilter === 'active')
        matches = matches && filtered.length > 0
      }
      
      if (departmentFilter !== 'all') {
        const filtered = filterUsersByDepartment([user], departmentFilter)
        matches = matches && filtered.length > 0
      }
      
      return matches
    })
    .sort((a, b) => b.createdAt - a.createdAt)

  const handleAddUser = () => {
    setSelectedUser(null)
    setIsDialogOpen(true)
  }

  const handleEditUser = (user: SystemUser) => {
    setSelectedUser(user)
    setIsDialogOpen(true)
  }

  const handleDeleteUser = (user: SystemUser) => {
    if (user.id === currentUser.id) {
      toast.error('Cannot delete your own account')
      return
    }

    if (confirm(`Are you sure you want to delete ${user.username}?`)) {
      setUsers(prev => prev.filter(u => u.id !== user.id))
      toast.success('User deleted successfully')
    }
  }

  const handleToggleStatus = (user: SystemUser) => {
    if (user.id === currentUser.id) {
      toast.error('Cannot deactivate your own account')
      return
    }

    setUsers(prev => prev.map(u => 
      u.id === user.id 
        ? { ...u, isActive: !u.isActive, updatedAt: Date.now() }
        : u
    ))
    toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`)
  }

  const handleManagePermissions = (user: SystemUser) => {
    setSelectedUser(user)
    setIsPermissionsDialogOpen(true)
  }

  const handleViewActivity = (user: SystemUser) => {
    setViewingUser(user)
    setIsActivityLogsOpen(true)
  }

  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length,
    admins: users.filter(u => u.role === 'admin').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage system users and their permissions</p>
        </div>
        <Button onClick={handleAddUser} size="lg">
          <Plus size={20} className="mr-2" />
          Add User
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-semibold mt-1">{stats.total}</p>
            </div>
            <User size={32} className="text-primary" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Users</p>
              <p className="text-2xl font-semibold mt-1">{stats.active}</p>
            </div>
            <Check size={32} className="text-success" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Inactive Users</p>
              <p className="text-2xl font-semibold mt-1">{stats.inactive}</p>
            </div>
            <X size={32} className="text-destructive" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Administrators</p>
              <p className="text-2xl font-semibold mt-1">{stats.admins}</p>
            </div>
            <UserGear size={32} className="text-accent" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <MagnifyingGlass size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by username, email, name, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as SystemRole | 'all')}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Administrator</SelectItem>
              <SelectItem value="procurement-manager">Procurement Manager</SelectItem>
              <SelectItem value="department-head">Department Head</SelectItem>
              <SelectItem value="storekeeper">Storekeeper</SelectItem>
              <SelectItem value="accounts">Accounts</SelectItem>
              <SelectItem value="user-requester">User/Requester</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | 'active' | 'inactive')}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select value={departmentFilter} onValueChange={(value) => setDepartmentFilter(value as Department | 'all')}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by department" />
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

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
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
                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(user.role)}>
                        {getRoleLabel(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.department ? (
                        <span className="capitalize">{user.department.replace('-', ' ')}</span>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? 'default' : 'secondary'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.lastLogin ? formatDateTime(user.lastLogin) : 'Never'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditUser(user)}
                          title="Edit user"
                        >
                          <PencilSimple size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleManagePermissions(user)}
                          title="Manage permissions"
                        >
                          <UserGear size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewActivity(user)}
                          title="View activity"
                        >
                          <ClockCounterClockwise size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleStatus(user)}
                          disabled={user.id === currentUser.id}
                          title={user.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {user.isActive ? <X size={16} /> : <Check size={16} />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteUser(user)}
                          disabled={user.id === currentUser.id}
                          title="Delete user"
                        >
                          <Trash size={16} className="text-destructive" />
                        </Button>
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
