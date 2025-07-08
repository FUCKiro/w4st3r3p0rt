import React from 'react';
import { WasteReport } from '../../lib/supabase';

interface WeeklyActivityProps {
  reports: WasteReport[];
}

export function WeeklyActivity({ reports }: WeeklyActivityProps) {
  // Get last 7 days activity
  const getWeeklyData = () => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const today = new Date();
    const weekData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      const dayReports = reports.filter(report => {
        const reportDate = new Date(report.created_at);
        return reportDate.toDateString() === date.toDateString();
      }).length;

      weekData.push({
        day: days[date.getDay()],
        count: dayReports
      });
    }

    return weekData;
  };

  const weeklyData = getWeeklyData();
  const maxCount = Math.max(...weeklyData.map(d => d.count), 1);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Weekly Activity
      </h3>
      
      <div className="flex items-end justify-between h-24 space-x-2">
        {weeklyData.map((data, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-t-lg overflow-hidden">
              <div
                className="bg-teal-500 transition-all duration-500 ease-out rounded-t-lg"
                style={{
                  height: `${(data.count / maxCount) * 64}px`,
                  minHeight: data.count > 0 ? '8px' : '0px'
                }}
              />
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-2">
              {data.day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}