import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverlay,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { WidgetRenderer } from './DashboardWidgets'
import type { DashboardLayout, DashboardWidget } from '@/lib/types'

interface SortableWidgetProps {
  widget: DashboardWidget
  layout: DashboardLayout | null
  metrics: any
  data: any
  onNavigate?: (module: string) => void
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
        return 'col-span-1 2xl:col-span-6'
      
      case 'full':
        return 'col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 2xl:col-span-6'
      
      default:
        return 'col-span-1 2xl:col-span-3'
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={getWidgetColSpan()}
      {...attributes}
      {...listeners}
    >
      <WidgetRenderer
        widget={widget}
        metrics={metrics}
        data={data}
        onNavigate={onNavigate}
      />
    </div>
  )
}

interface DraggableDashboardGridProps {
  layout: DashboardLayout | null
  metrics: any
  data: any
  onNavigate?: (module: string) => void
  onLayoutChange?: (layout: DashboardLayout) => void
  dragEnabled?: boolean
  onDragEnabledChange?: (enabled: boolean) => void
}

export function DraggableDashboardGrid({
  layout,
  metrics,
  data,
  onNavigate,
  onLayoutChange,
  dragEnabled = false,
}: DraggableDashboardGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    setActiveId(null)

    if (!over || active.id === over.id || !layout || !onLayoutChange) {
      return
    }

    const oldIndex = layout.widgets.findIndex((w) => w.id === active.id)
    const newIndex = layout.widgets.findIndex((w) => w.id === over.id)

    if (oldIndex !== -1 && newIndex !== -1) {
      const newWidgets = arrayMove(layout.widgets, oldIndex, newIndex).map((w, index) => ({
        ...w,
        position: index,
      }))

      const updatedLayout: DashboardLayout = {
        ...layout,
        widgets: newWidgets,
        updatedAt: Date.now(),
      }

      onLayoutChange(updatedLayout)
    }
  }

  if (!layout) {
    return null
  }

  const visibleWidgets = layout.widgets.filter((w) => w.isVisible)
  const gridColumns = 
    layout.columns === 1 
      ? 'grid-cols-1'
      : layout.columns === 3
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6'
      : layout.columns === 4
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6'
      : 'grid-cols-1 sm:grid-cols-2 2xl:grid-cols-6'

  if (!dragEnabled) {
    return (
      <div className={`grid ${gridColumns} gap-4 sm:gap-5 lg:gap-6`}>
        {visibleWidgets.map((widget) => (
          <div key={widget.id} className={getStaticWidgetColSpan(widget, layout)}>
            <WidgetRenderer
              widget={widget}
              metrics={metrics}
              data={data}
              onNavigate={onNavigate}
            />
          </div>
        ))}
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={visibleWidgets.map((w) => w.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={`grid ${gridColumns} gap-4 sm:gap-5 lg:gap-6`}>
          {visibleWidgets.map((widget) => (
            <SortableWidget
              key={widget.id}
              widget={widget}
              layout={layout}
              metrics={metrics}
              data={data}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeId ? (
          <div className="opacity-50">
            <WidgetRenderer
              widget={visibleWidgets.find((w) => w.id === activeId)!}
              metrics={metrics}
              data={data}
              onNavigate={onNavigate}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

function getStaticWidgetColSpan(widget: DashboardWidget, layout: DashboardLayout | null) {
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
      return 'col-span-1 2xl:col-span-6'
    
    case 'full':
      return 'col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 2xl:col-span-6'
    
    default:
      return 'col-span-1 2xl:col-span-3'
  }
}
