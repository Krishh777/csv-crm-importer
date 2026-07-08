const FEW_SHOT_EXAMPLES = `
Example 1 - Standard Format:
Input: {"Full Name": "John Doe", "Email": "john@example.com", "Phone": "9876543210", "Company": "Tech Corp"}
Output: {"name": {"value": "John Doe", "confidence": 0.95}, "email": {"value": "john@example.com", "confidence": 0.98}, "mobile_without_country_code": {"value": "9876543210", "confidence": 0.92}, "company": {"value": "Tech Corp", "confidence": 0.94}}

Example 2 - Merged Columns:
Input: {"Contact Info": "John Doe (john@example.com, 9876543210)", "Source": "leads_on_demand"}
Output: {"name": {"value": "John Doe", "confidence": 0.88}, "email": {"value": "john@example.com", "confidence": 0.91}, "mobile_without_country_code": {"value": "9876543210", "confidence": 0.85}}

Example 3 - Multiple Emails:
Input: {"Name": "Sarah Johnson", "Email Addresses": "sarah@main.com, sarah@alt.com"}
Output: {"name": {"value": "Sarah Johnson", "confidence": 0.96}, "email": {"value": "sarah@main.com", "confidence": 0.94}, "crm_note": {"value": "Additional email: sarah@alt.com", "confidence": 0.92}}

Example 4 - Excel Date:
Input: {"Name": "Rajesh Patel", "Date Created": 45000, "Email": "rajesh@example.com"}
Output: {"name": {"value": "Rajesh Patel", "confidence": 0.95}, "created_at": {"value": "2023-01-01T00:00:00Z", "confidence": 0.89}, "email": {"value": "rajesh@example.com", "confidence": 0.97}}
`;

export const generateSystemPrompt = (): string => {
  return `You are an expert at extracting CRM lead data from CSV records. Extract and map CSV fields to CRM format with confidence scores.

CRM Fields: created_at, name, email, country_code, mobile_without_country_code, company, city, state, country, lead_owner, crm_status, crm_note, data_source, possession_time, description

CRM Status Values (STRICT): GOOD_LEAD_FOLLOW_UP, DID_NOT_CONNECT, BAD_LEAD, SALE_DONE
Data Source Values (STRICT): leads_on_demand, meridian_tower, eden_park, varah_swamy, sarjapur_plots

RULES:
1. Skip records with neither email NOR mobile number
2. Convert dates to ISO 8601 format
3. Extract only digits for mobile (remove country codes/special chars)
4. Keep + prefix for country codes
5. Use first email/mobile, put extras in crm_note
6. Confidence: 0.95+ = high, 0.5-0.8 = medium, <0.5 = low
7. Return ONLY valid JSON

FEW-SHOT EXAMPLES:
${FEW_SHOT_EXAMPLES}

RETURN JSON with structure: {"fieldName": {"value": any, "confidence": number}, "_skip": {"value": boolean, "reason": string}}`;
};
