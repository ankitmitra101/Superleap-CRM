import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLeads } from '../features/leads/hooks/useLeads';
import { LeadsTable } from '../features/leads/components/LeadsTable';
import { LeadsToolbar } from '../features/leads/components/LeadsToolbar';
import { LeadFormModal } from '../features/leads/components/LeadFormModal';
import type { Lead } from '../features/leads/types';
import { useLeadFilters } from '../features/leads/hooks/useLeadFilters';
import { BulkActionBar } from '../features/leads/components/BulkActionBar';
import { Toaster } from 'sonner';

//  Set how many leads should render per page to prevent DOM freezing
const ITEMS_PER_PAGE = 50;

export const LeadsPage: React.FC = () => {
  // --- Server State ---
  const { data: leads, isLoading, isError } = useLeads();
  
  // --- URL State (The Single Source of Truth) ---
  const [searchParams, setSearchParams] = useSearchParams();
  
  // 1. Table Filters
  const { search: searchQuery, status: statusFilter } = useLeadFilters();

  // 2. Modal State (Deep-linking)
  const action = searchParams.get('action'); // 'create', 'edit', or 'view'
  const editId = searchParams.get('id'); // The ID of the lead being edited/viewed

  // 3. Pagination & Sort State
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const sortBy = searchParams.get('sort') || 'newest';

  // --- Derived State ---
  // If we are editing OR viewing, find the specific lead from our fetched data
  const isModalOpen = action === 'create' || action === 'edit' || action === 'view';
  
  const leadToEdit = useMemo(() => {
    if ((action === 'edit' || action === 'view') && editId && leads) {
      return leads.find(l => l.id === editId) || null;
    }
    return null;
  }, [action, editId, leads]);

  //  Filter -> Sort -> Paginate
  const { paginatedLeads, totalPages, totalMatches } = useMemo(() => {
    if (!leads) return { paginatedLeads: [], totalPages: 0, totalMatches: 0 };
    
    // 1. FILTER
    let processed = leads.filter(lead => {
      const safeSearch = searchQuery.toLowerCase(); 
      const matchesSearch = 
        lead.name.toLowerCase().includes(safeSearch) || 
        lead.email.toLowerCase().includes(safeSearch);
      const matchesStatus = statusFilter ? lead.status === statusFilter : true;
      return matchesSearch && matchesStatus;
    });

    // 2. SORT
    processed.sort((a, b) => {
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
      if (sortBy === 'oldest') return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      // Default: 'newest'
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

    // 3. PAGINATE
    const total = processed.length;
    const pages = Math.ceil(total / ITEMS_PER_PAGE);
    
    // Safety check: If filtering reduces results so much that the current page is empty, snap to the last available page (or page 1).
    let safePage = currentPage;
    if (currentPage > pages && pages > 0) safePage = pages;
    else if (pages === 0) safePage = 1;
    
    const startIdx = (safePage - 1) * ITEMS_PER_PAGE;
    const paginated = processed.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    return { paginatedLeads: paginated, totalPages: pages, totalMatches: total };
  }, [leads, searchQuery, statusFilter, sortBy, currentPage]);

  // --- Handlers (Updating the URL instead of local state) ---
  const handleAddClick = () => {
    searchParams.set('action', 'create');
    searchParams.delete('id'); 
    setSearchParams(searchParams);
  };

  const handleEditClick = (lead: Lead) => {
    searchParams.set('action', 'edit');
    searchParams.set('id', lead.id);
    setSearchParams(searchParams);
  };

  const handleViewClick = (lead: Lead) => {
    searchParams.set('action', 'view');
    searchParams.set('id', lead.id);
    setSearchParams(searchParams);
  };

  const handleCloseModal = () => {
    searchParams.delete('action');
    searchParams.delete('id');
    setSearchParams(searchParams);
  };

  // Pagination & Sort Handlers
  const handlePageChange = (newPage: number) => {
    searchParams.set('page', newPage.toString());
    setSearchParams(searchParams);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    searchParams.set('sort', e.target.value);
    searchParams.set('page', '1'); // Always reset to page 1 when sorting changes
    setSearchParams(searchParams);
  };

  return (
    // Added pb-24 to ensure the pagination doesn't get hidden behind the floating Bulk Action Bar
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 relative pb-24">
      {/* Header Area */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Leads Management</h1>
        <div className="flex items-center gap-4">
          
          {/* SORT DROPDOWN */}
          <select 
            value={sortBy} 
            onChange={handleSortChange}
            className="text-sm border border-gray-300 rounded-lg text-gray-700 focus:ring-blue-500 focus:border-blue-500 py-2 pl-3 pr-8 bg-white shadow-sm cursor-pointer outline-none"
          >
            <option value="newest">Last Updated (Newest)</option>
            <option value="oldest">Last Updated (Oldest)</option>
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
          </select>

          <button 
            onClick={handleAddClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm"
          >
            + Add Lead
          </button>
        </div>
      </div>

      {/* Toolbar (Search & Filter) */}
      <LeadsToolbar />

      {/* Loading & Error States */}
      {isLoading && (
        <div className="p-12 text-center text-gray-500 animate-pulse bg-white rounded-lg border border-gray-200">
          Loading leads data...
        </div>
      )}

      {isError && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          Failed to load leads. Please check if your mock server is running on port 4000.
        </div>
      )}

      {/* Data Table Area */}
      {leads && !isLoading && !isError && (
        totalMatches === 0 ? (
          <div className="p-12 text-center bg-white rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-sm font-medium text-gray-900">No leads found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter to find what you're looking for.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Table */}
            <LeadsTable leads={paginatedLeads} onEdit={handleEditClick} onView={handleViewClick} />
            
            {/* PAGINATION FOOTER */}
            <div className="flex items-center justify-between px-2 pt-2 border-t border-gray-100">
              <span className="text-sm text-gray-500">
                Showing <span className="font-medium text-gray-900">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> to <span className="font-medium text-gray-900">{Math.min(currentPage * ITEMS_PER_PAGE, totalMatches)}</span> of <span className="font-medium text-gray-900">{totalMatches}</span> leads
              </span>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )
      )}

      {/* Form Modal */}
      <LeadFormModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        leadToEdit={leadToEdit}
        mode={(action === 'edit' || action === 'view') ? action : 'create'} 
      />

      <BulkActionBar />
      <Toaster position="bottom-right" richColors />
    </div>
  );
};