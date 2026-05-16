import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateLeadStatus } from '../api/leads';
import { getValidNextStatuses } from '../utils/statusRules';
import { Badge } from '../../../components/Badge';
import { ChevronDown, Loader2 } from 'lucide-react';
import type { Lead } from '../types';

export const StatusCell: React.FC<{ lead: Lead }> = ({ lead }) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  
  // Gets only the allowed next steps (e.g., NEW -> CONTACTED or LOST)
  const nextOptions = getValidNextStatuses(lead.status);

  const { mutate, isPending } = useMutation({
    mutationFn: (newStatus: any) => updateLeadStatus(lead.id, newStatus),
    onSuccess: () => {
      // Refresh the table when the status changes successfully
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setIsOpen(false);
    },
  });

  return (
    <div className="relative">
      {/* The trigger button (only clickable if there are valid next steps) */}
      <button 
        onClick={() => nextOptions.length > 0 && setIsOpen(!isOpen)}
        className={`flex items-center gap-1 group ${nextOptions.length > 0 ? 'cursor-pointer' : 'cursor-default'}`}
      >
        <Badge status={lead.status} />
        {nextOptions.length > 0 && !isPending && (
          <ChevronDown size={14} className="text-gray-400 group-hover:text-gray-700 transition-colors" />
        )}
        {isPending && <Loader2 size={14} className="animate-spin text-blue-500" />}
      </button>

      {/* The Dropdown Menu */}
      {isOpen && (
        <>
          {/* Invisible overlay to close dropdown when clicking outside */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          
          <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 overflow-hidden">
            <div className="px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Transition to
            </div>
            {nextOptions.map((option) => (
              <button
                key={option}
                onClick={() => mutate(option)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors font-medium"
              >
                {option}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};