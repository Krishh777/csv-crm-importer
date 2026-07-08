export interface CRMRecord {
  created_at?: string;
  name?: string;
  email?: string;
  country_code?: string;
  mobile_without_country_code?: string;
  company?: string;
  city?: string;
  state?: string;
  country?: string;
  lead_owner?: string;
  crm_status?: CRMStatus;
  crm_note?: string;
  data_source?: DataSource;
  possession_time?: string;
  description?: string;
}

export interface ExtractedField {
  value: any;
  confidence: number;
  original_column?: string;
}

export interface ExtractedRecord {
  [key: string]: ExtractedField;
}

export type CRMStatus = 
  | 'GOOD_LEAD_FOLLOW_UP'
  | 'DID_NOT_CONNECT'
  | 'BAD_LEAD'
  | 'SALE_DONE';

export type DataSource = 
  | 'leads_on_demand'
  | 'meridian_tower'
  | 'eden_park'
  | 'varah_swamy'
  | 'sarjapur_plots';

export interface ColumnMapping {
  [csvColumn: string]: keyof CRMRecord;
}

export interface DetectedMapping {
  [csvColumn: string]: {
    targetField: keyof CRMRecord;
    confidence: number;
    reason: string;
  };
}

export interface UploadResponse {
  uploadId: string;
  fileName: string;
  totalRows: number;
  preview: Record<string, any>[];
  detectedMappings: DetectedMapping;
  headers: string[];
}

export interface ExtractResponse {
  records: CRMRecord[];
  skipped: SkippedRecord[];
  stats: {
    totalRows: number;
    successfulRecords: number;
    skippedRecords: number;
    failedRecords: number;
    tokensUsed: number;
    estimatedCost: string;
    processingTimeMs: number;
    duplicatesMerged: number;
  };
}

export interface SkippedRecord {
  rowIndex: number;
  data: Record<string, any>;
  reason: string;
}

export interface ProgressEvent {
  type: 'progress' | 'batch_complete' | 'stats' | 'error' | 'complete';
  batch?: number;
  total?: number;
  status?: string;
  message: string;
  data?: any;
}

export interface ProcessingOptions {
  uploadId: string;
  mappings: ColumnMapping;
  batchSize?: number;
  maxRetries?: number;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}
