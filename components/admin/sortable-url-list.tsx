
'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type UrlItem = {
  id: string;
  value: string;
};

// --- Single Sortable Item ---
function SortableItem({
  item,
  onRemove,
  onUpdate,
}: {
  item: UrlItem;
  onRemove: (id: string) => void;
  onUpdate: (id: string, value: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 p-2 rounded-md bg-muted/50 border border-transparent transition-shadow',
        isDragging && 'shadow-lg bg-background border-primary'
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab p-1.5 text-muted-foreground hover:text-foreground touch-none"
        aria-label="Reordenar opción"
      >
        <GripVertical size={18} />
      </button>
      <Input
        type="url"
        value={item.value}
        onChange={(e) => onUpdate(item.id, e.target.value)}
        placeholder="https://ejemplo.com/stream.m3u8"
        className="flex-grow bg-background"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-destructive shrink-0"
        onClick={() => onRemove(item.id)}
        aria-label="Eliminar opción"
      >
        <Trash2 size={16} />
      </Button>
    </div>
  );
}

// --- Main List Component ---
export function SortableUrlList({
  items,
  setItems,
  placeholder = 'https://ejemplo.com/stream.m3u8',
}: {
  items: UrlItem[];
  setItems: (items: UrlItem[]) => void;
  placeholder?: string;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleAddItem = () => {
    const newItem: UrlItem = { id: `${Date.now()}`, value: '' };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    } else {
      // If it's the last one, just clear it instead of removing
      setItems([{ id: items[0].id, value: '' }]);
    }
  };

  const handleUpdateItem = (id: string, value: string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, value } : item)));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      setItems(arrayMove(items, oldIndex, newIndex));
    }
  };

  return (
    <div className="space-y-3 p-3 border rounded-lg bg-muted/20">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((item, index) => (
              <SortableItem
                key={item.id}
                item={item}
                onRemove={handleRemoveItem}
                onUpdate={handleUpdateItem}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
        <Plus className="mr-2" size={16} />
        Añadir Opción
      </Button>
    </div>
  );
}
