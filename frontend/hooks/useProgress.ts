'use client';

import { useState, useEffect } from 'react';
import { ProgressEvent } from '../types';

export const useProgress = () => {
  const [events, setEvents] = useState<ProgressEvent[]>([]);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [status, setStatus] = useState<'idle' | 'processing' | 'complete' | 'error'>('idle');

  const addEvent = (event: ProgressEvent) => {
    setEvents((prev) => [...prev, event]);

    if (event.type === 'progress') {
      setCurrentBatch(event.batch || 0);
      setTotalBatches(event.total || 0);
      setStatus('processing');
    } else if (event.type === 'complete') {
      setStatus('complete');
    } else if (event.type === 'error') {
      setStatus('error');
    }
  };

  const reset = () => {
    setEvents([]);
    setCurrentBatch(0);
    setTotalBatches(0);
    setStatus('idle');
  };

  return {
    events,
    currentBatch,
    totalBatches,
    status,
    progress: totalBatches > 0 ? (currentBatch / totalBatches) * 100 : 0,
    addEvent,
    reset,
  };
};
