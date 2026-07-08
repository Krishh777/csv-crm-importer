'use client';

import { useRef, useState } from 'react';
import '../styles/table.css';

interface ResponsiveTableProps {
  data: Record<string, any>[];
}

export const ResponsiveTable = ({ data }: ResponsiveTableProps) => {
  const tableRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    setCanScrollLeft(element.scrollLeft > 0);
    setCanScrollRight(element.scrollLeft < element.scrollWidth - element.clientWidth);
  };

  if (data.length === 0) {
    return <div className="p-8 text-center text-gray-500">No data to display</div>;
  }

  return (
    <div className="relative">
      <div
        ref={tableRef}
        onScroll={handleScroll}
        className="overflow-x-auto responsive-table-container"
      >
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 sticky top-0">
              {columns.map(col => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white border-b dark:border-gray-600 whitespace-nowrap"
                >
                  {col.replace(/_/g, ' ').toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                {columns.map(col => (
                  <td
                    key={`${rowIndex}-${col}`}
                    className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap overflow-hidden text-ellipsis"
                    title={String(row[col])}
                  >
                    {row[col] !== null && row[col] !== undefined ? String(row[col]).substring(0, 50) : '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-gray-800 to-transparent pointer-events-none" />
      )}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-gray-800 to-transparent pointer-events-none" />
      )}
    </div>
  );
};
