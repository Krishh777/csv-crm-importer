export const excelDateToISO = (excelDate: number): string => {
  const excelEpoch = new Date(1900, 0, 1);
  const daysOffset = excelDate - 1;
  const resultDate = new Date(excelEpoch.getTime() + daysOffset * 24 * 60 * 60 * 1000);
  return resultDate.toISOString();
};

export const extractMobileNumber = (phoneStr: string): string => {
  return phoneStr.replace(/\D/g, '');
};

export const extractCountryCode = (phoneStr: string): string | null => {
  const match = phoneStr.match(/^\+?\d{1,3}/);
  return match ? `+${match[0].replace(/\D/g, '')}` : null;
};

export const parseDate = (dateStr: any): string | null => {
  if (!dateStr) return null;
  if (typeof dateStr === 'number') {
    try {
      return excelDateToISO(dateStr);
    } catch {
      return null;
    }
  }
  if (typeof dateStr === 'string') {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }
  return null;
};

export const sanitizeText = (text: any): string => {
  if (typeof text !== 'string') {
    return String(text || '').trim();
  }
  return text.trim().replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
};

export const extractFirstEmail = (emailStr: string): { email: string; others: string[] } => {
  const emails = emailStr.split(',').map(e => e.trim()).filter(e => e.length > 0 && e !== 'N/A' && e !== 'NA');
  return { email: emails[0] || '', others: emails.slice(1) };
};

export const extractFirstMobile = (mobileStr: string): { mobile: string; others: string[] } => {
  const mobiles = mobileStr.split(',').map(m => m.trim()).filter(m => m.length > 0 && m !== 'N/A' && m !== 'NA');
  return { mobile: mobiles[0] || '', others: mobiles.slice(1) };
};

export const normalizeWhitespace = (text: string): string => {
  return text.replace(/\s+/g, ' ').trim();
};
