import React from 'react';

interface KpiCardProps {
  title: string;
  // Change this from 'number' to 'string | number'
  value: string | number; 
  color: string;
  trend?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({ title, value, color, trend }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
    <div className="flex items-end justify-between mt-2">
      {/* If value is a number, we might want to format it. 
         If it's a string, we just display it.
      */}
      <h3 className={`text-2xl font-bold truncate ${color}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </h3>
      {trend && (
        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full whitespace-nowrap ml-2">
          {trend}
        </span>
      )}
    </div>
  </div>
);