import React, { useMemo, useState } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  type DragStartEvent, 
  type DragEndEvent 
} from '@dnd-kit/core';
import { useQueryClient, useMutation } from '@tanstack/react-query';

import { useLeads } from '../features/leads/hooks/useLeads';
import { useLeadFilters } from '../features/leads/hooks/useLeadFilters';
import { LeadsToolbar } from '../features/leads/components/LeadsToolbar';
import { BoardColumn } from '../features/leads/components/board/BoardColumn';
import { LeadCard } from '../features/leads/components/board/LeadCard';
import { LeadFormModal } from '../features/leads/components/LeadFormModal'; // Added import

import { groupLeadsByStatus, BOARD_COLUMNS } from '../features/leads/utils/board';
import { isValidTransition } from '../features/leads/domain/rules';
import { updateLead } from '../features/leads/api/leads';
import type { Lead, LeadStatus } from '../features/leads/types';

export const BoardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: leads, isLoading, isError } = useLeads();
  const { search, status } = useLeadFilters();

  // --- Modal & Editing State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // --- Drag & Drop UI State ---
  const [activeLead, setActiveLead] = useState<Lead | null>(null);

  // --- Physics & Sensors ---
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // --- Modal Handlers ---
  const handleOpenCreate = () => {
    setSelectedLead(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (lead: Lead) => {
    setSelectedLead(lead);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  // --- Data Processing ---
  const filteredLeads = useMemo(() => {
    if (!leads) return [];
    return leads.filter(lead => {
      const safeSearch = search.toLowerCase();
      const matchesSearch = 
        lead.name.toLowerCase().includes(safeSearch) || 
        lead.email.toLowerCase().includes(safeSearch);
      const matchesStatus = status ? lead.status === status : true;
      return matchesSearch && matchesStatus;
    });
  }, [leads, search, status]);

  const groupedLeads = useMemo(() => groupLeadsByStatus(filteredLeads), [filteredLeads]);

  // --- Optimistic Mutation (Drag & Drop) ---
  const moveLeadMutation = useMutation({
    mutationFn: ({ id, newStatus }: { id: string; newStatus: LeadStatus }) => 
      updateLead(id, { status: newStatus }),
    
    onMutate: async ({ id, newStatus }) => {
      await queryClient.cancelQueries({ queryKey: ['leads'] });
      const previousLeads = queryClient.getQueryData<Lead[]>(['leads']);

      if (previousLeads) {
        queryClient.setQueryData<Lead[]>(['leads'], (old) => 
          old?.map(lead => lead.id === id ? { ...lead, status: newStatus } : lead)
        );
      }
      return { previousLeads };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousLeads) {
        queryClient.setQueryData(['leads'], context.previousLeads);
      }
      alert('Failed to update lead status. The board has been reverted.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    }
  });

  // --- Drag Handlers ---
  const handleDragStart = (event: DragStartEvent) => {
    const { lead } = event.active.data.current as { lead: Lead };
    setActiveLead(lead);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveLead(null);
    const { active, over } = event;
    if (!over) return;

    const currentLead = active.data.current?.lead as Lead;
    const targetStatus = over.id as LeadStatus;

    if (currentLead.status === targetStatus) return;
    if (!isValidTransition(currentLead.status, targetStatus)) return; 

    moveLeadMutation.mutate({ id: currentLead.id, newStatus: targetStatus });
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 h-screen flex flex-col overflow-hidden">
      {/* Header Area */}
      <div className="flex justify-between items-center shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">Lead Pipeline</h1>
        <button 
          onClick={handleOpenCreate} // Linked to handler
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm"
        >
          + Add Lead
        </button>
      </div>

      <LeadsToolbar />

      {/* Board Area */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl">
            <p className="text-gray-500 animate-pulse font-medium">Loading board engine...</p>
          </div>
        ) : isError ? (
          <div className="h-full flex items-center justify-center border-2 border-dashed border-red-200 rounded-xl bg-red-50">
            <p className="text-red-500 font-medium">Failed to load leads.</p>
          </div>
        ) : (
          <DndContext 
            sensors={sensors} 
            onDragStart={handleDragStart} 
            onDragEnd={handleDragEnd}
          >
            <div className="flex h-full gap-6 overflow-x-auto pb-4 snap-x">
              {BOARD_COLUMNS.map(status => (
                <div key={status} className="snap-start">
                  <BoardColumn 
                    id={status} 
                    title={status.replace('_', ' ')} 
                    leads={groupedLeads[status]} 
                    onLeadClick={handleOpenEdit} // Pass click handler down to cards
                  />
                </div>
              ))}
            </div>

            <DragOverlay dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
              {activeLead ? <LeadCard lead={activeLead} /> : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Reusable Modal for Create/Edit/View */}
      <LeadFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        leadToEdit={selectedLead}
        mode={modalMode}
      />
    </div>
  );
};