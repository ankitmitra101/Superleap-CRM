import React, { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSelectionStore } from '../../../store/useSelectionStore';
import { getBulkTransitionOptions } from '../../../domain/leads/transitionEngine';
import { useLeads } from '../hooks/useLeads';
import { type LeadStatus } from '../types';

//  Make sure executeBulkDelete is added to your bulkMutationService.ts!
import { executeBulkStatusChange, executeBulkDelete } from '../services/bulkMutationService';

export const BulkActionBar: React.FC = () => {
  // 1. ALL HOOKS CALLED AT THE TOP (Unconditionally to prevent crashes)
  const { selectedIds, clear } = useSelectionStore();
  const { data: leads } = useLeads();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  const count = selectedIds.size;
  
  const selectedStatuses = useMemo(() => {
    if (!leads) return [];
    return leads
      .filter((l) => selectedIds.has(l.id))
      .map((l) => l.status);
  }, [leads, selectedIds]);

  // 2. EARLY RETURN (Safe here because hooks are done)
  if (count === 0) return null;

  // 3. Domain Logic & Handlers
  const transitionData = getBulkTransitionOptions(selectedStatuses);

  // Status Change Handler
  const handleBulkUpdate = async (status: LeadStatus) => {
    setIsPending(true);
    await executeBulkStatusChange(selectedIds, status);
    await queryClient.invalidateQueries({ queryKey: ['leads'] });
    clear();
    setIsPending(false);
  };

  //  NEW: Delete Handler with Assessment-Required Confirmation
  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete ${count} leads? This action cannot be undone.`)) {
      return;
    }
    setIsPending(true);
    await executeBulkDelete(selectedIds);
    await queryClient.invalidateQueries({ queryKey: ['leads'] });
    clear();
    setIsPending(false);
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-4 bg-slate-900/95 backdrop-blur-md border border-slate-700/50 shadow-2xl px-6 py-3 rounded-full text-slate-100 animate-in slide-in-from-bottom-10 fade-in duration-300">
      
      {/* Selection Counter */}
      <div className="flex items-center gap-3 pr-4 border-r border-slate-700">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-inner">
          {count}
        </span>
        <span className="text-sm font-medium tracking-wide">Selected</span>
      </div>

      {/* Dynamic Status Buttons based on Transition Engine */}
      <div className="flex items-center gap-2">
        {transitionData.isDisabled ? (
          <span className="text-xs text-slate-400 italic px-2 max-w-[200px] truncate">
            {transitionData.reason}
          </span>
        ) : (
          transitionData.validTransitions.map((status) => (
            <button
              key={status}
              onClick={() => handleBulkUpdate(status)}
              disabled={isPending}
              className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-md transition-colors"
            >
              Move to {status}
            </button>
          ))
        )}
      </div>

      {/*  NEW: Delete & Clear Actions */}
      <div className="pl-2 border-l border-slate-700 flex items-center gap-1">
        <button 
          onClick={handleBulkDelete}
          disabled={isPending}
          className="px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-md transition-colors disabled:opacity-50"
        >
          Delete All
        </button>
        <button 
          onClick={clear} 
          disabled={isPending}
          className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors rounded-full hover:bg-slate-800" 
          aria-label="Clear selection"
        >
           ✕
        </button>
      </div>
      
    </div>
  );
};