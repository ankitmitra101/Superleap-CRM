import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Lead } from '../../types';

interface LeadCardProps {
  lead: Lead;
  onClick?: () => void; // Added: Allow the card to handle clicks
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead, onClick }) => {
  // 1. Hook the card into the @dnd-kit physics engine
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
    data: { lead }, 
  });

  // 2. Apply hardware-accelerated CSS transforms during the drag
  const style = {
    transform: CSS.Translate.toString(transform),
  };

  // 3. Render the UI
  if (isDragging) {
    return (
      <div 
        ref={setNodeRef} 
        style={style} 
        className="opacity-30 bg-white border-2 border-blue-400 border-dashed rounded-lg h-28" 
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick} // Added: This triggers the edit modal
      className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all cursor-grab active:cursor-grabbing group select-none flex flex-col gap-2"
    >
      <div className="flex justify-between items-start">
        <div className="truncate pr-4">
          <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
            {lead.name}
          </h4>
          <p className="text-xs text-gray-500 truncate mt-0.5">{lead.email}</p>
        </div>
      </div>
      
      <div className="flex justify-between items-end mt-1">
        <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider bg-gray-50 px-2 py-1 rounded">
          {lead.source || 'Direct'}
        </span>
        <span className="text-[11px] text-gray-400">
          {new Date(lead.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </span>
      </div>
    </div>
  );
};