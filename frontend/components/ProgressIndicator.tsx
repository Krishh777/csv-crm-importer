'use client';

import { CheckCircle, Circle } from 'lucide-react';

interface ProgressIndicatorProps {
  currentStep: string;
}

const STEPS = [
  { id: 'upload', label: 'Upload' },
  { id: 'preview', label: 'Preview' },
  { id: 'mapping', label: 'Mapping' },
  { id: 'processing', label: 'Processing' },
  { id: 'results', label: 'Results' },
];

export const ProgressIndicator = ({ currentStep }: ProgressIndicatorProps) => {
  const currentIndex = STEPS.findIndex(step => step.id === currentStep);

  return (
    <div className="flex items-center justify-between">
      {STEPS.map((step, index) => (
        <div key={step.id} className="flex items-center flex-1">
          <div className="relative flex flex-col items-center flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                index < currentIndex
                  ? 'bg-green-500 text-white'
                  : index === currentIndex
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
              }`}
            >
              {index < currentIndex ? <CheckCircle size={24} /> : index + 1}
            </div>
            <span className="text-xs mt-2 text-center font-semibold text-gray-700 dark:text-gray-300">
              {step.label}
            </span>
          </div>
          {index < STEPS.length - 1 && (
            <div
              className={`flex-1 h-1 mx-2 ${
                index < currentIndex ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};
