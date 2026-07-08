'use client';

import { useState, useCallback } from 'react';
import { ColumnMapping, ExtractResponse, ProgressEvent } from '../types';
import axios from 'axios';

export const useCSVImport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressEvent | null>(null);
  const [results, setResults] = useState<ExtractResponse | null>(null);

  const extractRecords = useCallback(
    async (uploadId: string, mappings: ColumnMapping) => {
      setLoading(true);
      setError(null);
      setProgress(null);

      try {
        const eventSource = new EventSource(
          `${process.env.NEXT_PUBLIC_API_URL}/api/csv/extract?uploadId=${uploadId}&mappings=${JSON.stringify(mappings)}`
        );

        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          setProgress(data);

          if (data.type === 'complete') {
            setResults(data.data);
            eventSource.close();
            setLoading(false);
          }
        };

        eventSource.onerror = (err) => {
          setError('Failed to process records');
          eventSource.close();
          setLoading(false);
        };
      } catch (err: any) {
        setError(err.message || 'An error occurred');
        setLoading(false);
      }
    },
    []
  );

  return { loading, error, progress, results, extractRecords };
};
