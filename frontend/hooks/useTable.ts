'use client';

import { useState, useEffect } from 'react';

export const useTable = (data: Record<string, any>[], pageSize: number = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filteredData, setFilteredData] = useState(data);

  useEffect(() => {
    let sorted = [...data];

    if (sortColumn) {
      sorted.sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        const order = sortOrder === 'asc' ? 1 : -1;

        if (aVal < bVal) return -1 * order;
        if (aVal > bVal) return 1 * order;
        return 0;
      });
    }

    setFilteredData(sorted);
  }, [data, sortColumn, sortOrder]);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(filteredData.length / pageSize);

  return {
    data: paginatedData,
    currentPage,
    setCurrentPage,
    totalPages,
    sortColumn,
    setSortColumn,
    sortOrder,
    setSortOrder,
    totalItems: filteredData.length,
  };
};
