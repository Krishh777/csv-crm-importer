'use client';

import { useState } from 'react';
import { UploadStep } from '../components/UploadStep';
import { PreviewStep } from '../components/PreviewStep';
import { MappingStep } from '../components/MappingStep';
import { ResultsStep } from '../components/ResultsStep';
import { ProgressIndicator } from '../components/ProgressIndicator';

export default function Home() {
  const [step, setStep] = useState<'upload' | 'preview' | 'mapping' | 'processing' | 'results'>('upload');
  const [uploadId, setUploadId] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [preview, setPreview] = useState<Record<string, any>[]>([]);
  const [detectedMappings, setDetectedMappings] = useState<Record<string, any>>({});
  const [headers, setHeaders] = useState<string[]>([]);
  const [finalMappings, setFinalMappings] = useState<Record<string, string>>({});
  const [results, setResults] = useState<any>(null);
  const [totalRows, setTotalRows] = useState(0);

  const handleUploadSuccess = (data: any) => {
    setUploadId(data.uploadId);
    setFileName(data.fileName);
    setPreview(data.preview);
    setDetectedMappings(data.detectedMappings);
    setHeaders(data.headers);
    setTotalRows(data.totalRows);
    setStep('preview');
  };

  const handleMappingConfirm = (mappings: Record<string, string>) => {
    setFinalMappings(mappings);
    setStep('processing');
  };

  const handleResultsReceived = (data: any) => {
    setResults(data);
    setStep('results');
  };

  return (
    <div className="py-8">
      <div className="mb-8">
        <ProgressIndicator currentStep={step} />
      </div>

      {step === 'upload' && (
        <UploadStep onSuccess={handleUploadSuccess} />
      )}

      {step === 'preview' && (
        <PreviewStep
          fileName={fileName}
          totalRows={totalRows}
          preview={preview}
          onNext={() => setStep('mapping')}
        />
      )}

      {step === 'mapping' && (
        <MappingStep
          headers={headers}
          detectedMappings={detectedMappings}
          onConfirm={handleMappingConfirm}
        />
      )}

      {step === 'processing' && (
        <div className="text-center py-12">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-lg font-semibold">Processing your CSV...</p>
            <p className="text-gray-600 dark:text-gray-400 mt-2">This may take a few moments</p>
          </div>
        </div>
      )}

      {step === 'results' && results && (
        <ResultsStep data={results} />
      )}
    </div>
  );
}
