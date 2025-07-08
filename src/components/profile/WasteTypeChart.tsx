import React from 'react';
import { WasteReport } from '../../lib/supabase';
import { wasteTypes } from '../../lib/constants';

interface WasteTypeChartProps {
  reports: WasteReport[];
}

export function WasteTypeChart({ reports }: WasteTypeChartProps) {
  const wasteTypeData = reports.reduce((acc, report) => {
    const type = report.waste_type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const totalReports = reports.length;
  const colors = ['#14b8a6', '#06b6d4', '#f59e0b']; // teal, cyan, amber

  const segments = Object.entries(wasteTypeData)
    .slice(0, 3) // Show only top 3 types
    .map(([type, count], index) => ({
      type: parseInt(type),
      name: wasteTypes[parseInt(type)],
      count,
      percentage: (count / totalReports) * 100,
      color: colors[index]
    }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Tipo di Rifiuto
      </h3>
      
      {/* Progress Bar */}
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
        {segments.map((segment, index) => (
          <div
            key={segment.type}
            className="h-full float-left"
            style={{
              width: `${segment.percentage}%`,
              backgroundColor: segment.color
            }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {segments.map((segment) => (
          <div key={segment.type} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {segment.name.split(' ')[0]} {segment.name.split(' ')[1] && segment.name.split(' ')[1]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}