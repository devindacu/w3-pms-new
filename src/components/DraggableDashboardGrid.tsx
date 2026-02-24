import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  DragStartE
  useSensors,
  useSortable,
} from '@dnd-kit/
import { Widge

  widget
  metrics: a
  onNavigate?: (mo
}
function Sorta
    attributes,
    setNodeRef,
    transition,
  } = useSortable({ id: widget.id })
  const style = {

  }
  const getWidgetColSpan 
    
      case 'sm
        if 
      
        if (layout?.co
 

function SortableWidget({ widget, layout, metrics, data, onNavigate, isDragging }: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: widget.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  }

  const getWidgetColSpan = () => {
    if (layout?.columns === 1) return 'col-span-1'
    
    switch (widget.size) {
      case 'small':
        if (layout?.columns === 3) return 'col-span-1 2xl:col-span-2'
        if (layout?.columns === 4) return 'col-span-1 2xl:col-span-1'
        return 'col-span-1 2xl:col-span-2'
    </
      case 'medium':
        if (layout?.columns === 3) return 'col-span-1 md:col-span-2 lg:col-span-1 2xl:col-span-3'
        if (layout?.columns === 4) return 'col-span-1 sm:col-span-2 lg:col-span-2 2xl:col-span-3'
        return 'col-span-1 2xl:col-span-3'
      
      case 'large':
        if (layout?.columns === 3) return 'col-span-1 md:col-span-2 lg:col-span-3 2xl:col-span-6'
        if (layout?.columns === 4) return 'col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4 2xl:col-span-6'
        return 'col-span-1 2xl:col-span-6'
      
      case 'full':
        return 'col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 2xl:col-span-6'
      
  metrics,
        return 'col-span-1 2xl:col-span-3'
  onL
  }

  return (
    useS
      ref={setNodeRef}
    })
      className={getWidgetColSpan()}
  const handleDragSta
      {...listeners}
    >
      <WidgetRenderer
        widget={widget}
        metrics={metrics}
      const oldInde
        onNavigate={onNavigate}
      co
    </div>
   
}

interface DraggableDashboardGridProps {
  layout: DashboardLayout | null
  metrics: any

  onNavigate?: (module: string) => void
  onLayoutChange?: (layout: DashboardLayout) => void
  dragEnabled?: boolean
  onDragEnabledChange?: (enabled: boolean) => void
}

export function DraggableDashboardGrid({

  metrics,
    ret
  onNavigate,
      ? 'grid-col
  dragEnabled = false,
      : 'grid-cols-1 sm:grid-cols
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      <div className={`grid ${gridColumns} gap-4 sm:
    })
   

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
   

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event




































































































