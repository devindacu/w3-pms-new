import { useState } from 'react'
  DndCon
  KeyboardSen
  useSensor,
  DragStartEvent,
  DragOverlay,
import {
  SortableCon
  useSortable,
} from '@dnd-ki
import { Widge

  widget
  metrics: D
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
    
      case 'small':
        if 
      
        if (layout?.c
 

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
  }
  const handleDragEnd = (event: DragEndEve
    se
    if (over && ac
      const newIndex = layout.
      
        positi

     
   



    ? 'grid-cols-1'
    ? 'grid-cols-1 
    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-col

    return (
     
            key={widget.id}
            layout={lay
            data={data}
            isDragging={fal
        ))}
    )

    <DndCont
      coll
   
 

        <div className={`grid ${gridCol
            <SortableWidg
              widget={widg
           
              onNavigate={onNavigate}
            />
        </div>
      <DragOverlay>
 

              data={data}
         
        ) 
    </D
}













































































































