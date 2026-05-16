import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { LeadCard } from './LeadCard';
import type { Lead, LeadStatus } from '../../types';

interface BoardColumnProps {
  id: LeadStatus;
  title: string;
  leads: Lead[];
  onLeadClick: (lead: Lead) => void; // Added: handler for clicking a card
}

export const BoardColumn: React.FC<BoardColumnProps> = ({ id, title, leads, onLeadClick }) => {
  // 1. Tell @dnd-kit that this column can accept dropped items
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <div className="flex flex-col h-full w-80 shrink-0 bg-gray-50/50 rounded-xl border border-gray-200 overflow-hidden">
      
      {/* Sticky Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/80 backdrop-blur-sm sticky top-0 z-10">
        <h3 className="font-semibold text-sm text-gray-700 uppercase tracking-wide">
          {title}
        </h3>
        <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">
          {leads.length}
        </span>
      </div>

      {/* Scrollable Card Container */}
      <div 
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto p-3 space-y-3 transition-colors duration-200 ${
          isOver ? 'bg-blue-50/50' : ''
        }`}
      >
        {leads.map((lead) => (
          <LeadCard 
            key={lead.id} 
            lead={lead} 
            onClick={() => onLeadClick(lead)} // Added: trigger the edit modal on click
          />
        ))}
        
        {/* Empty State Guard */}
        {leads.length === 0 && (
          <div className="h-24 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-xs text-gray-400 font-medium">Drop leads here</span>
          </div>
        )}
      </div>
    </div>
  );
};