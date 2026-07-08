'use client';

import { ResponsiveTable } from './ResponsiveTable';
import { ChevronRight } from 'lucide-react';

interface PreviewStepProps {
  fileName: string;
  totalRows: number;
  preview: Record<string, any>[];
  onNext: () => void;
}

export const PreviewStep = ({ fileName, totalRows, preview, onNext }: PreviewStepProps) => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-2">CSV Preview</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          File: <span className="font-semibold">{fileName}</span> • Total Rows: <span className="font-semibold">{totalRows}</span>
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <ResponsiveTable data={preview} />
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2"
        >
          Next: Review Mappings
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};
