import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useLeads } from '../features/leads/hooks/useLeads';
import { KpiCard } from '../features/analytics/components/KpiCard';

const STATUS_COLORS: Record<string, string> = {
  NEW: '#64748b',       // Slate
  CONTACTED: '#3b82f6', // Blue
  QUALIFIED: '#a855f7', // Purple
  CONVERTED: '#22c55e', // Green
  LOST: '#ef4444',      // Red
};

export const DashboardPage: React.FC = () => {
  const { data: leads = [] } = useLeads();

  // --- Data Transformation Logic ---
  const { chartData, stats } = useMemo(() => {
    const counts = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const chartFormatted = Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));

    const total = leads.length;
    const conversionRate = total > 0 
      ? ((counts['CONVERTED'] || 0) / total * 100).toFixed(1) 
      : 0;

    return { chartData: chartFormatted, stats: { total, conversionRate, counts } };
  }, [leads]);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics Overview</h1>
        <p className="text-gray-500">Real-time performance of your sales pipeline.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard title="Total Leads" value={stats.total} color="text-gray-900" />
        <KpiCard title="Converted" value={stats.counts['CONVERTED'] || 0} color="text-green-600" />
        <KpiCard title="Conversion Rate" value={Number(stats.conversionRate)} color="text-blue-600" trend={`${stats.conversionRate}%`} />
      </div>

      {/* Main Chart Section */}
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold mb-6">Pipeline Distribution</h2>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={60}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#cbd5e1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};