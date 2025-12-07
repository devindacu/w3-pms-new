import { useState, useEffect } from 'react'
import { CaretDown, CaretRight } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useKV } from '@github/spark/hooks'

interface CollapsibleSidebarGroupProps {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
  groupId?: string
}

export function CollapsibleSidebarGroup({
  title,
  icon,
  children,
  defaultOpen = false,
  className,
  groupId
}: CollapsibleSidebarGroupProps) {
  const storageKey = groupId ? `sidebar-group-${groupId}` : null
  const [persistedState, setPersistedState] = useKV<boolean>(
    storageKey || `sidebar-group-${title.toLowerCase().replace(/\s+/g, '-')}`,
    defaultOpen
  )
  const [isOpen, setIsOpen] = useState(persistedState ?? defaultOpen)

  useEffect(() => {
    if (persistedState !== undefined) {
      setIsOpen(persistedState)
    }
  }, [persistedState])

  const handleToggle = () => {
    const newState = !isOpen
    setIsOpen(newState)
    setPersistedState(newState)
  }

  return (
    <div className={cn("space-y-1", className)}>
      <Button
        variant="ghost"
        className="w-full justify-between px-3 py-2 h-auto font-semibold text-xs uppercase tracking-wide text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
        onClick={handleToggle}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span>{title}</span>
        </div>
        {isOpen ? (
          <CaretDown size={16} className="shrink-0 transition-transform" />
        ) : (
          <CaretRight size={16} className="shrink-0 transition-transform" />
        )}
      </Button>
      
      {isOpen && (
        <div className="space-y-1 pl-2 animate-in fade-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  )
}
