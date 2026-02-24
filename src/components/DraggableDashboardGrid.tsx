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
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { DashboardWidget, DashboardLayout, DashboardMetrics } from '@/lib/types'
import { WidgetRenderer } from '@/components/DashboardWidgets'
import { GripVertical, ArrowsOutCardinal } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface SortableWidgetProps {
  widget: DashboardWidget
  layout: DashboardLayout
  metrics: DashboardMetrics
  data: any
  onNavigate?: (module: string) => void
  dragEnabled?: boolean
}

function SortableWidget({ widget, layout, metrics, data, onNavigate, dragEnabled }: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: widget.id, disabled: !dragEnabled })

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
      className={`relative group ${getWidgetColSpan()}`}
    >
      {dragEnabled && (
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
      <div className={`h-full ${isSortableDragging ? 'ring-2 ring-primary ring-offset-2' : ''} ${dragEnabled ? 'cursor-grab active:cursor-grabbing' : ''}`}>
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
  onDragEnabledChange,
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

  const visibleWidgets = (layout?.widgets || [])
    .filter(w => w.isVisible)
    .sort((a, b) => a.position - b.position)

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (over && active.id !== over.id) {
      const oldIndex = visibleWidgets.findIndex((w) => w.id === active.id)
      const newIndex = visibleWidgets.findIndex((w) => w.id === over.id)

      const reorderedWidgets = arrayMove(visibleWidgets, oldIndex, newIndex)
      
      const updatedWidgets = reorderedWidgets.map((widget, index) => ({
        ...widget,
        position: index,
      }))

      const allWidgets = layout.widgets.map(widget => {
        const updated = updatedWidgets.find(w => w.id === widget.id)
        return updated || widget
      })

      const updatedLayout: DashboardLayout = {
        ...layout,
        widgets: allWidgets,
        updatedAt: Date.now(),
      }

      onLayoutChange(updatedLayout)
      
      const movedWidget = visibleWidgets.find(w => w.id === active.id)
      toast.success(`Moved "${movedWidget?.title}" to new position`)
    }
  }

  const handleDragCancel = () => {
    setActiveId(null)
  }

  const activeWidget = activeId ? visibleWidgets.find(w => w.id === activeId) : null

  return (
    <>
      {dragEnabled && (
        <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg flex items-center gap-3">
          <ArrowsOutCardinal size={20} className="text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium text-primary">Rearrange Mode Active</p>
            <p className="text-xs text-muted-foreground">Drag widgets to reorder your dashboard</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDragEnabledChange?.(false)}
          >
            Done
          </Button>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext
          items={visibleWidgets.map(w => w.id)}
          strategy={rectSortingStrategy}
        >
          <div className={`grid gap-4 sm:gap-6 ${
            layout?.columns === 1 
              ? 'grid-cols-1' 
              : layout?.columns === 3 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6' 
              : layout?.columns === 4 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6' 
              : 'grid-cols-1 md:grid-cols-2 2xl:grid-cols-6'
          }`}>
            {visibleWidgets.map((widget) => (
              <SortableWidget
                key={widget.id}
                widget={widget}
                layout={layout}
                metrics={metrics}
                data={data}
                onNavigate={onNavigate}
                dragEnabled={dragEnabled}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeWidget && (
            <div className="opacity-90 cursor-grabbing scale-105">
              <Card className="p-4 shadow-2xl border-2 border-primary">
                <div className="flex items-center gap-2">
                  <GripVertical size={20} className="text-primary" />
                  <span className="font-semibold">{activeWidget.title}</span>
                </div>
              </Card>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </>
  )
}
