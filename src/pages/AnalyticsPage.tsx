import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useLeads } from '../features/leads/hooks/useLeads';
import { KpiCard } from '../features/analytics/components/KpiCard';

const SOURCE_COLORS = ['#3b82f6', '#a855f7', '#22c55e', '#f59e0b', '#ef4444'];

export const AnalyticsPage: React.FC = () => {
  const { data: leads = [] } = useLeads();

  const sourceData = useMemo(() => {
    // 1. Group leads by source and count them
    const counts = leads.reduce((acc, lead) => {
      const source = lead.source || 'Direct';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 2. Convert to array and SORT by value descending
    // This ensures sourceData[0] is always the true "Top Performing Source"
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [leads]);

  // Derived stats for the UI
  const topSource = sourceData[0]?.name || 'N/A';
  const totalLeads = leads.length;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Advanced Analytics</h1>
        <p className="text-gray-500">Deep dive into lead acquisition and channel performance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Source Distribution Donut Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-6">Lead Source Distribution</h2>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={100}
                  outerRadius={140}
                  paddingAngle={8}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1200}
                >
                  {sourceData.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={SOURCE_COLORS[index % SOURCE_COLORS.length]} 
                      className="hover:opacity-80 transition-opacity outline-none"
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Summary Stats & Breakdown */}
        <div className="space-y-6">
          <KpiCard 
            title="Top Performing Source" 
            value={topSource} 
            color="text-blue-600" 
          />

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full">
            <h3 className="text-sm font-medium text-gray-500 mb-6 uppercase tracking-wider">
              Breakdown by Volume
            </h3>
            <div className="space-y-4">
              {sourceData.length > 0 ? (
                sourceData.map((item, idx) => {
                  const percentage = ((item.value / totalLeads) * 100).toFixed(1);
                  return (
                    <div key={item.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">{item.name}</span>
                        <span className="text-sm font-bold text-gray-900">{item.value}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div 
                          className="h-1.5 rounded-full transition-all duration-1000"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: SOURCE_COLORS[idx % SOURCE_COLORS.length] 
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-400 italic">No lead data available yet.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};