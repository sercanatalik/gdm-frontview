"use client"

import * as React from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Check, GripVertical, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export interface SelectOption {
  id: string
  label: string
  [key: string]: any // Allow additional properties
}

export interface MultiSelectDraggableProps {
  /** Array of options to select from */
  options: SelectOption[]
  /** Currently selected item IDs */
  value?: string[]
  /** Callback when selection changes */
  onChange?: (value: string[]) => void
  /** Placeholder text when no items are selected */
  placeholder?: string
  /** Help text displayed below the component */
  helpText?: string
  /** Additional CSS classes */
  className?: string
  /** Disable the component */
  disabled?: boolean
}

interface SortableItemProps {
  id: string
  label: string
  onRemove: (id: string) => void
}

function SortableItem({ id, label, onRemove }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "mr-1 select-none py-1 pl-1.5 pr-1 text-xs whitespace-nowrap font-normal",
        isDragging && "opacity-50",
      )}
    >
      <Badge
        variant="secondary"
        className="flex items-center"
      >
        <span className="flex items-center gap-1">
          <Button
            {...listeners}
            {...attributes}
            variant="ghost"
            size="sm"
            className="h-3 w-3 p-0 opacity-50 hover:bg-transparent hover:opacity-100"
          >
            <GripVertical className="h-2.5 w-2.5" />
            <span className="sr-only">Drag to reorder</span>
          </Button>
          {label}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="ml-1 h-3 w-3 p-0 opacity-50 hover:bg-transparent hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation()
            onRemove(id)
          }}
        >
          <X className="h-2.5 w-2.5" />
          <span className="sr-only">Remove</span>
        </Button>
      </Badge>
    </div>
  )
}

/**
 * A multi-select component with drag-and-drop reordering capability
 */
export function MultiSelectDraggable({
  options,
  value,
  onChange,
  placeholder = "Click to select items",
  helpText = "Click to select items, drag handles to reorder",
  className,
  disabled = false,
}: MultiSelectDraggableProps) {
  const [selectedItems, setSelectedItems] = React.useState<string[]>(value || [])
  const [open, setOpen] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)

  // Update internal state when value prop changes
  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedItems(value)
    }
  }, [value])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleSelectItem = (itemId: string) => {
    if (!selectedItems.includes(itemId)) {
      const newSelectedItems = [...selectedItems, itemId]
      setSelectedItems(newSelectedItems)
      onChange?.(newSelectedItems)
    }
    setOpen(false)
  }

  const handleDragStart = () => {
    setIsDragging(true)
    if (open) setOpen(false)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false)
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = selectedItems.indexOf(active.id as string)
      const newIndex = selectedItems.indexOf(over.id as string)
      const newSelectedItems = arrayMove(selectedItems, oldIndex, newIndex)

      setSelectedItems(newSelectedItems)
      onChange?.(newSelectedItems)
    }
  }

  const removeItem = (id: string) => {
    const newSelectedItems = selectedItems.filter((item) => item !== id)
    setSelectedItems(newSelectedItems)
    onChange?.(newSelectedItems)
  }

  // Get the full item objects for the selected IDs
  const selectedItemObjects = selectedItems
    .map((id) => options.find((option) => option.id === id))
    .filter(Boolean) as SelectOption[]

  // Filter out already selected items
  const availableOptions = options.filter((option) => !selectedItems.includes(option.id))

  return (
    <div className={cn("w-full ", className)}>
      <Popover
        open={disabled ? false : open}
        onOpenChange={(newOpen) => {
          if (disabled || (isDragging && newOpen)) return
          setOpen(newOpen)
        }}
      >
        <PopoverTrigger asChild disabled={disabled}>
          <div
            ref={containerRef}
            className={cn(
              "relative rounded-md bg-background p-2 transition-colors w-[500px]",
              disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-muted/50",
            )}
            role={disabled ? undefined : "button"}
            tabIndex={disabled ? undefined : 0}
            aria-haspopup={disabled ? undefined : "listbox"}
            onClick={(e) => {
              if (disabled || isDragging) return
              e.stopPropagation()
            }}
          >
            {selectedItems.length === 0 ? (
              <div className="flex h-full text-muted-foreground font-normal">{placeholder}</div>
            ) : (
              <div
                ref={scrollContainerRef}
                className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent"
              >
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={selectedItems} strategy={horizontalListSortingStrategy}>
                    <div className="flex items-center">
                      {selectedItemObjects.map((item) => (
                        <SortableItem key={item.id} id={item.id} label={item.label} onRemove={removeItem} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start" alignOffset={100} sideOffset={0}>
          <Command>
            <CommandInput placeholder="Search items..." className="text-xs" />
            <CommandEmpty className="text-xs font-normal">No item found.</CommandEmpty>
            <CommandGroup>
              <CommandList>
                {availableOptions.map((option) => (
                  <CommandItem
                    key={option.id}
                    value={option.id}
                    onSelect={handleSelectItem}
                    className="text-xs font-normal"
                  >
                    <Check
                      className={cn("mr-2 h-3 w-3", selectedItems.includes(option.id) ? "opacity-100" : "opacity-0")}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandList>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

