import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { House, FolderOpen, ChartBar, Users, Gear } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

type NavItem = 'dashboard' | 'projects' | 'analytics' | 'team' | 'settings'

interface SidebarProps {
  currentView: NavItem
  onNavigate: (view: NavItem) => void
}

export function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const navItems = [
    { id: 'dashboard' as NavItem, label: 'Dashboard', icon: House },
    { id: 'projects' as NavItem, label: 'Projects', icon: FolderOpen },
    { id: 'analytics' as NavItem, label: 'Analytics', icon: ChartBar },
    { id: 'team' as NavItem, label: 'Team', icon: Users },
    { id: 'settings' as NavItem, label: 'Settings', icon: Gear }
  ]

  return (
    <aside className="w-64 border-r bg-card h-screen sticky top-0 flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-semibold">W3 PMS</h1>
        <p className="text-xs text-muted-foreground mt-1">Project Management</p>
      </div>

      <Separator />

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant={currentView === item.id ? 'secondary' : 'ghost'}
            className={cn(
              'w-full justify-start',
              currentView === item.id && 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
            onClick={() => onNavigate(item.id)}
          >
            <item.icon size={18} className="mr-3" weight={currentView === item.id ? 'fill' : 'regular'} />
            {item.label}
          </Button>
        ))}
      </nav>

      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground">
          <p>Enterprise Edition</p>
          <p className="mt-1">v2.0.0</p>
        </div>
      </div>
    </aside>
  )
}
