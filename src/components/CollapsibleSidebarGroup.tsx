import { useState, useEffect, Children, cloneElement, isValidElement } from 'react'
import { CaretDown, CaretRight, DotsSixVertical } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useKV } from '@github/spark/hooks'
import { Reorder, useDragControls } from 'framer-motion'

interface CollapsibleSidebarGroupProps {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
  groupId?: string
}

interface MenuItem {
  id: string
  element: React.ReactElement<any>
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

  const orderKey = groupId ? `sidebar-order-${groupId}` : `sidebar-order-${title.toLowerCase().replace(/\s+/g, '-')}`
  const [savedOrder, setSavedOrder] = useKV<string[]>(orderKey, [])
  
  const childArray = Children.toArray(children).filter(child => isValidElement(child)) as React.ReactElement<any>[]
  const [items, setItems] = useState<MenuItem[]>(() => {
    const itemsMap = childArray.map((child, index) => {
      const childProps = child.props as any
      let itemId = `item-${index}`
      
      if (childProps?.onClick) {
        const match = childProps.onClick.toString().match(/setCurrentModule\(['"]([^'"]+)['"]\)/)
        if (match && match[1]) {
          itemId = match[1]
        }
      }
      
      return {
        id: itemId,
        element: child
      }
    })

    if (savedOrder && savedOrder.length === itemsMap.length) {
      return savedOrder.map(id => itemsMap.find(item => item.id === id)!).filter(Boolean)
    }
    
    return itemsMap
  })

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

  const handleReorder = (newItems: MenuItem[]) => {
    setItems(newItems)
    setSavedOrder(newItems.map(item => item.id))
  }

  return (
    <div className={cn("space-y-0.5", className)}>
      <Button
        variant="ghost"
        className="w-full justify-between px-2 py-1.5 h-auto font-semibold text-[10px] uppercase tracking-wide text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
        onClick={handleToggle}
      >
        <div className="flex items-center gap-1.5">
          {icon}
          <span>{title}</span>
        </div>
        {isOpen ? (
          <CaretDown size={14} className="shrink-0 transition-transform" />
        ) : (
          <CaretRight size={14} className="shrink-0 transition-transform" />
        )}
      </Button>
      
      {isOpen && (
        <Reorder.Group
          axis="y"
          values={items}
          onReorder={handleReorder}
          className="space-y-0.5 pl-1"
        >
          {items.map((item) => (
            <ReorderItem key={item.id} item={item} />
          ))}
        </Reorder.Group>
      )}
    </div>
  )
}

interface ReorderItemProps {
  item: MenuItem
}

function ReorderItem({ item }: ReorderItemProps) {
  const dragControls = useDragControls()

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={dragControls}
      className="relative group"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-0.5">
        <button
          className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-0.5 hover:bg-accent/50 rounded flex-shrink-0"
          onPointerDown={(e) => dragControls.start(e)}
          aria-label="Drag to reorder"
        >
          <DotsSixVertical size={12} className="text-muted-foreground" />
        </button>
        <div className="flex-1">
          {cloneElement(item.element, {
            className: cn(item.element.props.className, "transition-all")
          })}
        </div>
      </div>
    </Reorder.Item>
  )
}
