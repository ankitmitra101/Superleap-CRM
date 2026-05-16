import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, PieChart, Kanban } from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  // 1. Define your navigation items in one place
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Leads (List)', path: '/leads', icon: Users },
    { name: 'Board (Kanban)', path: '/board', icon: Kanban },
    { name: 'Analytics', path: '/analytics', icon: PieChart },
  ];

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f172a] text-white flex flex-col shrink-0">
        <div className="p-6 text-xl font-bold border-b border-gray-800">
          Superleap CRM
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              // 2. This function automatically toggles the blue background based on the URL
              className={({ isActive }) =>
                `flex items-center space-x-3 p-3 rounded-lg transition-colors transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              <item.icon size={20} />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-800 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">
            AC
          </div>
          <span className="text-sm font-medium">Ankit Ch.</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        {/* 3. Outlet is the "placeholder" where BoardPage or DashboardPage renders */}
        <div className="min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};