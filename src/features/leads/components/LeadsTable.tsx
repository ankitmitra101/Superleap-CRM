import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteLead } from '../api/leads';
import { StatusCell } from './StatusCell';
import type { Lead } from '../types';

// We import our global selection store to decouple UI from business logic
import { useSelectionStore } from '../../../store/useSelectionStore';

interface LeadsTableProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onView: (lead: Lead) => void;
}

export const LeadsTable: React.FC<LeadsTableProps> = ({ leads, onEdit, onView }) => {
  const queryClient = useQueryClient();

  const { selectedIds, toggleId, selectAll, clear } = useSelectionStore();

  const isAllSelected = leads.length > 0 && selectedIds.size === leads.length;
  
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation(); // Stop bubbling on header as well
    if (isAllSelected) {
      clear();
    } else {
      selectAll(leads.map(lead => lead.id));
    }
  };

  const deleteMutation = useMutation({
    mutationFn: deleteLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      clear(); 
    },
  });

  return (
    <div className="overflow-x-auto bg-white border border-gray-100 rounded-xl shadow-sm">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50/50 border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wider">
          <tr>
            <th scope="col" className="px-6 py-4 w-12">
              <input 
                type="checkbox" 
                checked={isAllSelected}
                onChange={handleSelectAll}
                onClick={(e) => e.stopPropagation()} // Prevents header click issues
                className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 cursor-pointer transition-colors"
                aria-label="Select all leads"
              />
            </th>
            <th scope="col" className="px-6 py-4 font-medium">Name & Email</th>
            <th scope="col" className="px-6 py-4 font-medium">Status</th>
            <th scope="col" className="px-6 py-4 font-medium">Source</th>
            <th scope="col" className="px-6 py-4 font-medium">Last Updated</th>
            <th scope="col" className="px-6 py-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {leads.map((lead) => {
            const isSelected = selectedIds.has(lead.id);

            return (
              <tr 
                key={lead.id} 
                onClick={() => onView(lead)}
                className={`group cursor-pointer transition-all duration-200 ${
                  isSelected ? 'bg-blue-50/60' : 'hover:bg-[rgba(248,250,252,0.8)]'
                }`}
              >
                <td 
                  className="px-6 py-5 w-12"
                  onClick={(e) => e.stopPropagation()} 
                >
                  <input 
                    type="checkbox" 
                    checked={isSelected}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleId(lead.id);
                    }}
                    onClick={(e) => e.stopPropagation()} // <--- STOPS THE MODAL FROM OPENING
                    className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 cursor-pointer transition-colors"
                    aria-label={`Select ${lead.name}`}
                  />
                </td>
                
                <td className="px-6 py-5">
                  <div className="text-sm font-medium text-gray-900 tracking-tight">{lead.name}</div>
                  <div className="text-xs text-gray-400 font-normal mt-0.5">{lead.email}</div>
                </td>
                
                <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                  <StatusCell lead={lead} />
                </td>
                
                <td className="px-6 py-5 text-xs text-gray-500 font-medium capitalize">
                  {lead.source || '—'}
                </td>
                
                <td className="px-6 py-5 text-xs text-gray-400 font-light">
                  {new Date(lead.updated_at).toLocaleDateString(undefined, { 
                    month: 'short', day: 'numeric', year: 'numeric' 
                  })}
                </td>
                
                <td className="px-6 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(lead);
                      }}
                      className="text-xs font-medium text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      View
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(lead);
                      }}
                      className="text-xs font-medium text-gray-400 hover:text-indigo-600 transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
                          deleteMutation.mutate(lead.id);
                        }
                      }}
                      disabled={deleteMutation.isPending && deleteMutation.variables === lead.id}
                      className="text-xs font-medium text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      {deleteMutation.isPending && deleteMutation.variables === lead.id ? '...' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};