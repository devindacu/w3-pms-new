import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { User as UserIcon, Envelope, Phone, Shield } from '@phosphor-icons/react'
import type { SystemUser } from '@/lib/types'

interface UserPreferencesProps {
  currentUser: SystemUser
}

export function UserPreferences({ currentUser }: UserPreferencesProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  return (
    <div className="space-y-6">
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
          <Avatar className="h-24 w-24">
            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
              {getInitials(currentUser.firstName, currentUser.lastName)}
            </AvatarFallback>
          </Avatar>

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
                <p className="text-lg mt-1">
                  {currentUser.email}
                </p>
              </div>

              <div>
                <Label className="text-muted-foreground flex items-center gap-2">
                  <Phone size={16} />
                  Phone
                </Label>
                <p className="text-lg mt-1">
                  {currentUser.phone || 'Not provided'}
                </p>
              </div>

              <div>
                <Label className="text-muted-foreground flex items-center gap-2">
                  <Shield size={16} />
                  Role
                </Label>
                <p className="text-lg font-semibold mt-1 capitalize">
                  {currentUser.role.replace('-', ' ')}
                </p>
              </div>

              <div>
                <Label className="text-muted-foreground">Department</Label>
                <p className="text-lg font-semibold mt-1 capitalize">
                  {currentUser.department ? currentUser.department.replace('-', ' ') : 'Not assigned'}
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-muted-foreground">Permissions</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {currentUser.permissions.map((permission, idx) => (
                  <div
                    key={`${permission}-${idx}`}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {String(permission).replace('-', ' ')}
                  </div>
                ))}
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

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">About User Preferences</h3>
        <p className="text-muted-foreground mb-2">
          This section displays your user profile and account information. To modify your details or reset your password, please contact your system administrator.
        </p>
        <p className="text-sm text-muted-foreground">
          Your user permissions determine which modules and features you can access within the system.
        </p>
      </Card>
    </div>
  )
}
