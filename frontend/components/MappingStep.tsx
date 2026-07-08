'use client';

import { useState, useMemo } from 'react';
import { ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';

const CRM_FIELDS = [
  'name',
  'email',
  'mobile_without_country_code',
  'country_code',
  'company',
  'city',
  'state',
  'country',
  'lead_owner',
  'created_at',
  'crm_status',
  'crm_note',
  'data_source',
  'possession_time',
  'description',
];

interface MappingStepProps {
  headers: string[];
  detectedMappings: Record<string, any>;
  onConfirm: (mappings: Record<string, string>) => void;
}

export const MappingStep = ({ headers, detectedMappings, onConfirm }: MappingStepProps) => {
  const [mappings, setMappings] = useState<Record<string, string>>(
    Object.entries(detectedMappings).reduce((acc, [header, data]) => ({
      ...acc,
      [header]: data.targetField,
    }), {})
  );

  const handleMappingChange = (header: string, field: string) => {
    setMappings(prev => ({
      ...prev,
      [header]: field || '',
    }));
  };

  const lowConfidenceCount = useMemo(() => {
    return Object.entries(detectedMappings).filter(
      ([_, data]) => data.confidence < 0.8
    ).length;
  }, [detectedMappings]);

  return (
    <div className="space-y-6">
      {lowConfidenceCount > 0 && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-yellow-900 dark:text-yellow-200">
              {lowConfidenceCount} low-confidence mappings detected
            </p>
            <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
              Please review and correct the field mappings before proceeding
            </p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">Review Column Mappings</h2>

        <div className="space-y-4">
          {headers.map(header => {
            const detected = detectedMappings[header];
            const confidenceColor =
              detected.confidence > 0.8
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : detected.confidence > 0.5
                ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                : 'border-red-500 bg-red-50 dark:bg-red-900/20';

            return (
              <div
                key={header}
                className={`border-2 rounded-lg p-4 ${confidenceColor}`}
              >
                <div className="grid grid-cols-3 gap-4 items-center">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">CSV Column</p>
                    <p className="font-semibold text-lg">{header}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Confidence</p>
                    <p className="font-semibold">{(detected.confidence * 100).toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Map to CRM Field</p>
                    <select
                      value={mappings[header] || ''}
                      onChange={(e) => handleMappingChange(header, e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="">-- Skip this column --</option>
                      {CRM_FIELDS.map(field => (
                        <option key={field} value={field}>
                          {field}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{detected.reason}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          className="flex items-center gap-2 px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-semibold"
        >
          <ChevronLeft size={20} />
          Back
        </button>
        <button
          onClick={() => onConfirm(mappings)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2"
        >
          Start Processing
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};
