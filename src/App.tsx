import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LeadsPage } from './pages/LeadsPage';
import { BoardPage } from './pages/BoardPage';
import { DashboardPage } from './pages/DashboardPage';
import { AnalyticsPage } from './pages/AnalyticsPage'; // 1. Added this import

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* The DashboardLayout provides the Sidebar shell */}
        <Route element={<DashboardLayout />}>
          
          {/* Default Redirect: Home goes to Dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* 2. DASHBOARD: Shows the Bar Charts (Pipeline Distribution) */}
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* 3. ANALYTICS: Shows the Pie Chart (Source Breakdown) */}
          <Route path="/analytics" element={<AnalyticsPage />} />
          
          {/* 4. LEADS: Shows the Table List View */}
          <Route path="/leads" element={<LeadsPage />} />
          
          {/* 5. BOARD: Shows the Kanban/Drag-and-Drop View */}
          <Route path="/board" element={<BoardPage />} />
          
        </Route>

        {/* 6. Catch-all: Safety redirect for mistyped URLs */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;