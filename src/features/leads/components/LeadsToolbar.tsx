import React from 'react';
import { Search, Filter, List, LayoutGrid } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLeadFilters } from '../hooks/useLeadFilters';

export const LeadsToolbar: React.FC = () => {
  // 1. We now use our centralized hook instead of manual URL parsing
  const { search, status, setSearch, setStatus, searchParams } = useLeadFilters();
  
  const location = useLocation();
  const navigate = useNavigate();

  // 2. Check which view we are currently on
  const isBoardView = location.pathname.includes('/board');

  // 3. Handle switching views while keeping the URL filters intact
  const handleViewToggle = (view: 'list' | 'board') => {
    const path = view === 'list' ? '/leads' : '/board';
    // This guarantees ?search=aman travels with you when you click "Board"
    navigate(`${path}?${searchParams.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      
      {/* NEW: View Toggle (List vs Board) */}
      <div className="flex bg-gray-100/80 p-1 rounded-lg border border-gray-200/50 w-fit">
        <button
          onClick={() => handleViewToggle('list')}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
            !isBoardView ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <List size={16} />
          List
        </button>
        <button
          onClick={() => handleViewToggle('board')}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
            isBoardView ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <LayoutGrid size={16} />
          Board
        </button>
      </div>

      {/* Search Input */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search leads by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm transition-colors"
        />
      </div>

      {/* Status Filter */}
      <div className="relative w-full sm:w-48">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Filter size={18} className="text-gray-400" />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm appearance-none cursor-pointer transition-colors"
        >
          <option value="">All Statuses</option>
          <option value="NEW">New</option>
          <option value="CONTACTED">Contacted</option>
          <option value="QUALIFIED">Qualified</option>
          <option value="CONVERTED">Converted</option>
          <option value="LOST">Lost</option>
        </select>
      </div>
    </div>
  );
};