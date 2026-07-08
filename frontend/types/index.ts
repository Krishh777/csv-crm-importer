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
  crm_status?: string;
  crm_note?: string;
  data_source?: string;
  possession_time?: string;
  description?: string;
}

export interface ColumnMapping {
  [csvColumn: string]: string;
}

export interface ExtractResponse {
  records: CRMRecord[];
  skipped: Array<{ rowIndex: number; data: Record<string, any>; reason: string }>;
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

export interface ProgressEvent {
  type: 'progress' | 'batch_complete' | 'stats' | 'error' | 'complete';
  batch?: number;
  total?: number;
  status?: string;
  message: string;
  data?: any;
}
