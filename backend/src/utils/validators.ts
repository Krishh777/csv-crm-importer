import { CRMRecord, CRMStatus, DataSource } from '../types';

const VALID_CRM_STATUSES: CRMStatus[] = [
  'GOOD_LEAD_FOLLOW_UP',
  'DID_NOT_CONNECT',
  'BAD_LEAD',
  'SALE_DONE',
];

const VALID_DATA_SOURCES: DataSource[] = [
  'leads_on_demand',
  'meridian_tower',
  'eden_park',
  'varah_swamy',
  'sarjapur_plots',
];

export const isValidCRMStatus = (status: any): status is CRMStatus => {
  return VALID_CRM_STATUSES.includes(status);
};

export const isValidDataSource = (source: any): source is DataSource => {
  return VALID_DATA_SOURCES.includes(source);
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidMobileNumber = (mobile: string): boolean => {
  const digitsOnly = mobile.replace(/\D/g, '');
  return digitsOnly.length >= 7 && digitsOnly.length <= 15;
};

export const isValidDate = (date: any): boolean => {
  const parsed = new Date(date);
  return !isNaN(parsed.getTime());
};

export const recordHasContactInfo = (record: CRMRecord): boolean => {
  return !!(record.email || record.mobile_without_country_code);
};

export const validateCRMRecord = (record: CRMRecord): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!record.email && !record.mobile_without_country_code) {
    errors.push('Record must have email or phone number');
  }

  if (record.email && !isValidEmail(record.email)) {
    errors.push(`Invalid email format: ${record.email}`);
  }

  if (record.mobile_without_country_code && !isValidMobileNumber(record.mobile_without_country_code)) {
    errors.push(`Invalid mobile number: ${record.mobile_without_country_code}`);
  }

  if (record.crm_status && !isValidCRMStatus(record.crm_status)) {
    errors.push(`Invalid CRM status: ${record.crm_status}`);
  }

  if (record.data_source && !isValidDataSource(record.data_source)) {
    errors.push(`Invalid data source: ${record.data_source}`);
  }

  if (record.created_at && !isValidDate(record.created_at)) {
    errors.push(`Invalid created_at date: ${record.created_at}`);
  }

  if (record.possession_time && !isValidDate(record.possession_time)) {
    errors.push(`Invalid possession_time date: ${record.possession_time}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
