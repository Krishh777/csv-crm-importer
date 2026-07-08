'use client';

import { CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { ResponsiveTable } from './ResponsiveTable';
import { ConfidenceIndicator } from './ConfidenceIndicator';

interface ResultsStepProps {
  data: any;
}

export const ResultsStep = ({ data }: ResultsStepProps) => {
  const { records, skipped, stats } = data;

  const recordsWithConfidence = records.map((record: any, index: number) => ({
    ...record,
    _index: index + 1,
    _status: 'success',
  }));

  const skippedWithReason = skipped.map((item: any, index: number) => ({
    ...item.data,
    _index: index + 1,
    _status: 'skipped',
    _reason: item.reason,
  }));

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Records</p>
          <p className="text-3xl font-bold text-blue-500">{stats.totalRecords}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Successfully Imported</p>
          <p className="text-3xl font-bold text-green-500">{stats.successfulRecords}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Skipped</p>
          <p className="text-3xl font-bold text-yellow-500">{stats.skippedRecords}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Estimated Cost</p>
          <p className="text-3xl font-bold text-purple-500">{stats.estimatedCost}</p>
        </div>
      </div>

      {/* Token Usage */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Processing Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-400">Tokens Used</p>
            <p className="font-semibold text-lg">{stats.totalTokensUsed.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Processing Time</p>
            <p className="font-semibold text-lg">{(stats.processingTimeMs / 1000).toFixed(2)}s</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Duplicates Merged</p>
            <p className="font-semibold text-lg">{stats.duplicatesMerged}</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Failed Records</p>
            <p className="font-semibold text-lg">{stats.failedRecords}</p>
          </div>
        </div>
      </div>

      {/* Successfully Imported Records */}
      {recordsWithConfidence.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="text-green-500" />
            <h3 className="text-lg font-semibold">Successfully Imported ({recordsWithConfidence.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <ResponsiveTable data={recordsWithConfidence.slice(0, 5)} />
          </div>
          {recordsWithConfidence.length > 5 && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
              Showing 5 of {recordsWithConfidence.length} records
            </p>
          )}
        </div>
      )}

      {/* Skipped Records */}
      {skippedWithReason.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="text-yellow-500" />
            <h3 className="text-lg font-semibold">Skipped Records ({skippedWithReason.length})</h3>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {skippedWithReason.map((item: any, index: number) => (
              <div key={index} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-200">
                  Row {item._index}: {item._reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export Button */}
      <div className="flex justify-center">
        <button
          onClick={() => {
            const csv = [
              Object.keys(recordsWithConfidence[0] || {}).join(','),
              ...recordsWithConfidence.map(r => Object.values(r).map((v: any) => `"${v}"`).join(','))
            ].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'imported_records.csv';
            a.click();
          }}
          className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold"
        >
          Download Results
        </button>
      </div>
    </div>
  );
};
