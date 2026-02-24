import { useState } from 'react'
  DndCon
  DndContext,
  closestCenter,
  DragEndEvent,
  DragOverlay,
import {
  SortableCon
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  data: any
  dragEnabled?: boolean

  const {
    listeners,
    transform,
    isDragging: isSortableDragging,

    transform: CSS.Transform.toString(trans


    if (layout?.columns =
    switch (widget.size) 
        if (layout?.columns
        ret
      case 'medium':
  isDragging?: boolean
}

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
      
      case 'medium':
        if (layout?.columns === 3) return 'col-span-1 md:col-span-2 lg:col-span-1 2xl:col-span-3'
        if (layout?.columns === 4) return 'col-span-1 sm:col-span-2 lg:col-span-2 2xl:col-span-3'
        return 'col-span-1 2xl:col-span-3'
      
      case 'large':
        if (layout?.columns === 3) return 'col-span-1 md:col-span-2 lg:col-span-3 2xl:col-span-6'
        if (layout?.columns === 4) return 'col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4 2xl:col-span-6'
        return 'col-span-1 md:col-span-2 2xl:col-span-6'
      
      </div>
        return 'col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 2xl:col-span-6'
}
      default:
        return 'col-span-1 2xl:col-span-3'
    }
  o

  onDragEn
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${getWidgetColSpan()}`}
    >
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
  const [activeId, setAct
          {...listeners}
          className="p-2 bg-background/90 backdrop-blur-sm border border-border rounded-md shadow-sm hover:bg-accent hover:text-accent-foreground cursor-grab active:cursor-grabbing"
          aria-label="Drag to reorder"
      },
          <GripVertical size={16} />
      coordinateG
      </div>
      <div className={`h-full ${isSortableDragging ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
        <WidgetRenderer
    .sort((a, b) => a.pos
          metrics={metrics}
          data={data}
          onNavigate={onNavigate}
        />
      </div>

  )
 

interface DraggableDashboardGridProps {
  layout: DashboardLayout
  metrics: DashboardMetrics
  data: any
  onNavigate?: (module: string) => void
  onLayoutChange: (layout: DashboardLayout) => void
 

        ...layout,
  layout,
      }
  data,
  onNavigate,
  onLayoutChange,
}: DraggableDashboardGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  
  const sensors = useSensors(

      activationConstraint: {
  return (
      },
  )


































































































