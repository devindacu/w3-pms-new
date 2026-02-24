import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from '@phosphor-icons/react'
import type { DashboardLayout, DashboardMetrics } from '@/lib/types'
import { WidgetRenderer } from '@/components/DashboardWidgets'

interface SortableWidgetProps {
  widget: any
  layout: DashboardLayout
  metrics: DashboardMetrics
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
        return 'col-span-1 md:col-span-2 2xl:col-span-6'
      
      case 'full-width':
        return 'col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 2xl:col-span-6'
      
      default:
        return 'col-span-1 2xl:col-span-3'
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${getWidgetColSpan()}`}
    >
      {isDragging && (
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            {...attributes}
            {...listeners}
            className="p-2 bg-background/90 backdrop-blur-sm border border-border rounded-md shadow-sm hover:bg-accent hover:text-accent-foreground cursor-grab active:cursor-grabbing"
            aria-label="Drag to reorder"
          >
            <GripVertical size={16} />
          </button>
        </div>
      )}
      <div className={`h-full ${isSortableDragging ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
        <WidgetRenderer
          widget={widget}
          metrics={metrics}
          data={data}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  )
}

interface DraggableDashboardGridProps {
  layout: DashboardLayout
  metrics: DashboardMetrics
  data: any
  onNavigate?: (module: string) => void
  onLayoutChange: (layout: DashboardLayout) => void
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
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    setActiveId(null)

    if (over && active.id !== over.id) {
      const oldIndex = layout.widgets.findIndex(w => w.id === active.id)
      const newIndex = layout.widgets.findIndex(w => w.id === over.id)
      
      const newWidgets = arrayMove(layout.widgets, oldIndex, newIndex).map((widget, index) => ({
        ...widget,
        position: index,
      }))

      onLayoutChange({
        ...layout,
        widgets: newWidgets,
        updatedAt: Date.now(),
      })
    }
  }

  const visibleWidgets = layout.widgets
    .filter(w => w.isVisible)
    .sort((a, b) => a.position - b.position)

  const gridCols = layout.columns === 1 
    ? 'grid-cols-1' 
    : layout.columns === 3
    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6'
    : layout.columns === 4
    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6'
    : 'grid-cols-1 md:grid-cols-2 2xl:grid-cols-6'

  if (!dragEnabled) {
    return (
      <div className={`grid ${gridCols} gap-4 sm:gap-5 lg:gap-6`}>
        {visibleWidgets.map(widget => (
          <SortableWidget
            key={widget.id}
            widget={widget}
            layout={layout}
            metrics={metrics}
            data={data}
            onNavigate={onNavigate}
            isDragging={false}
          />
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
        items={visibleWidgets.map(w => w.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={`grid ${gridCols} gap-4 sm:gap-5 lg:gap-6`}>
          {visibleWidgets.map(widget => (
            <SortableWidget
              key={widget.id}
              widget={widget}
              layout={layout}
              metrics={metrics}
              data={data}
              onNavigate={onNavigate}
              isDragging={dragEnabled}
            />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeId ? (
          <div className="opacity-50">
            <WidgetRenderer
              widget={visibleWidgets.find(w => w.id === activeId)!}
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
