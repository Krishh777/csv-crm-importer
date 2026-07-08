# CSV CRM Importer - Complete Explanation

## What Does This Do?

Imagine you have 1000 CSV files from different sources:
- Facebook lead exports (with different column names)
- Google Ads exports
- Excel sheets from your CRM
- Real estate listings
- Sales reports

Each one has **different column names and formats**. Manually converting each one would take forever.

This tool uses **AI (Claude) to automatically understand ANY CSV format** and converts it to your standard CRM format. It's like having a smart assistant who reads each CSV, figures out what each column means, and converts it to standard format.

---

## Simple Example

### Input CSV (Facebook Export)
```
Contact Name,Email Address,Phone Number
John Doe,john@example.com,9876543210
Sarah Johnson,sarah@example.com,9876543211
```

### AI Understands:
- "Contact Name" = Lead name
- "Email Address" = Email
- "Phone Number" = Mobile number

### Output (Standard CRM Format)
```
name,email,mobile_without_country_code
John Doe,john@example.com,9876543210
Sarah Johnson,sarah@example.com,9876543211
```

---

## How It Works (Step by Step)

### Step 1: Upload
```
User: "Here's my CSV file"
     ↓
System: "Got it! Let me parse the file"
     ↓
Display: CSV preview on screen
```

**What happens:**
- File is uploaded to backend
- CSV is parsed into rows
- First 5 rows shown as preview
- Column headers are extracted

---

### Step 2: Detect Mappings
```
System: "I see these columns: Full Name, Email, Ph No."
       ↓
       "Full Name" probably = "name"
       "Email" probably = "email"
       "Ph No." probably = "mobile_without_country_code"
       ↓
Display: Show mappings to user
```

**What happens:**
- Simple pattern matching on column headers
- Suggests most likely CRM field for each column
- User can override if wrong

---

### Step 3: Confirm Mappings
```
User: "These mappings look good, let's go"
     ↓
System: "Processing your data..."
```

**What happens:**
- User confirms the column mappings
- Backend splits CSV into batches (50 records each)
- Processing starts

---

### Step 4: AI Processing (The Magic)

For each record:

```
Record: {"Full Name": "John Doe", "Email": "john@example.com", "Ph No.": "9876543210"}
   ↓
Send to Claude AI with instructions:
   "Map this data to CRM format using the provided mappings"
   "Extract: name, email, mobile_without_country_code"
   "Give a confidence score for each field"
   ↓
Claude thinks:
   "Full Name" = "John Doe" → name ✓ (confidence: 0.95)
   "Email" = "john@example.com" → email ✓ (confidence: 0.98)
   "Ph No." = "9876543210" → mobile_without_country_code ✓ (confidence: 0.92)
   ↓
Return: {name: "John Doe", email: "john@example.com", mobile: "9876543210"}
```

**Key Features:**
- ✅ Handles merged columns ("John Doe (john@example.com)")
- ✅ Converts Excel dates (45000 → 2023-01-01)
- ✅ Extracts multiple emails (keeps first, saves extras in notes)
- ✅ Validates format (emails, phone numbers, dates)
- ✅ Skips records with no contact info
- ✅ Adds confidence scores

---

### Step 5: Deduplication

```
After all records processed:
   ↓
Find duplicates:
   "john@example.com" appears 3 times → Keep first, merge others
   "9876543210" appears 2 times → Keep first, merge others
   ↓
Add notes:
   "Merged from 3 records with same email"
```

---

### Step 6: Results

```
Display:
├─ Total Records: 100
├─ Successfully Imported: 98
├─ Skipped: 2 (no email/phone)
├─ Tokens Used: 15,000
├─ Estimated Cost: $0.075
├─ Processing Time: 45 seconds
└─ Duplicates Merged: 3
```

---

## Architecture (Simple Version)

### Frontend (Next.js)
```
User uploads file
     ↓
Show CSV preview
     ↓
Display column mappings
     ↓
Show real-time progress
     ↓
Display results
```

**Tech:** React, Tailwind CSS, TypeScript

### Backend (Node.js + Express)
```
Receive CSV file
     ↓
Parse CSV into rows
     ↓
Split into batches (50 records each)
     ↓
For each batch:
   - Call Claude AI
   - Transform data
   - Validate
     ↓
Deduplicate records
     ↓
Stream results back (SSE)
```

**Tech:** Express, TypeScript, Claude API

---

## What Makes This Special?

### 1. Intelligent Field Mapping
❌ **Other tools:** "I don't know what 'Ph No.' means"
✅ **Our tool:** "I see 'Ph No.' = Phone Number = mobile_without_country_code"

### 2. Confidence Scoring
❌ **Other tools:** "Here's the result" (no indication of accuracy)
✅ **Our tool:** "95% confident this is correct" (user can spot-check low scores)

### 3. Edge Case Handling
❌ **Other tools:** Break on merged columns, Excel dates, multiple emails
✅ **Our tool:** Handles all of these gracefully

### 4. Batch Retry Logic
❌ **Other tools:** Fail the entire import if one batch fails
✅ **Our tool:** Retry just that batch, mark failures clearly

### 5. Real-time Progress
❌ **Other tools:** Spinner that spins forever
✅ **Our tool:** "Batch 3 of 12 complete... 45% done"

### 6. Deduplication
❌ **Other tools:** "Here are 100 records" (including duplicates)
✅ **Our tool:** "Here are 97 records" (3 duplicates merged)

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│              USER BROWSER (Frontend)                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. Upload CSV ──────┐                            │
│                      ↓                             │
│  2. Preview Data ────┤                            │
│                      ↓                             │
│  3. Review Mappings ─┤                            │
│                      ↓                             │
│  4. Processing ──────┤ (Streaming Progress SSE)   │
│                      ↓                             │
│  5. Display Results ─┤                            │
│                      │                             │
└──────────────────────┼─────────────────────────────┘
                       │ HTTP/SSE
                       ↓
┌─────────────────────────────────────────────────────┐
│         BACKEND SERVER (Node.js + Express)         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  POST /api/csv/upload                              │
│  - Parse CSV                                       │
│  - Extract headers                                 │
│  - Return preview                                  │
│                                                     │
│  POST /api/csv/extract (SSE Response)              │
│  - Split records into batches                      │
│  - For each batch:                                 │
│    ├─ Send to Claude AI                            │
│    ├─ Transform data                               │
│    ├─ Validate fields                              │
│    └─ Stream progress                              │
│  - Deduplicate results                             │
│  - Return final records                            │
│                                                     │
└──────────────────────────────────────────────────────┘
                       │
                       ↓ (API calls)
┌─────────────────────────────────────────────────────┐
│            CLAUDE AI (Anthropic API)               │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Receives: Raw record + column mappings            │
│  Does: Intelligent field extraction                │
│  Returns: Extracted CRM record + confidence        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Code Flow Example

### User uploads CSV with 100 records:

```
1. Frontend sends: POST /api/csv/upload (file)
   Backend returns: uploadId, preview, detectedMappings

2. User reviews mappings and clicks "Extract"

3. Frontend sends: POST /api/csv/extract
   { uploadId: "xyz", mappings: {"Full Name": "name", ...} }

4. Backend processes in batches:
   
   Batch 1 (records 1-50):
   - For each record:
     a) Send to Claude: "Extract CRM fields"
     b) Claude returns: {name: "...", email: "...", ...}
     c) Validate data
     d) Store result
   - Send progress: "Batch 1/2 complete"
   
   Batch 2 (records 51-100):
   - Same process
   - Send progress: "Batch 2/2 complete"

5. Deduplicate:
   - Group by email/phone
   - Keep first, merge duplicates
   - Add merge notes

6. Return final results
   - 98 successfully imported
   - 2 skipped (no email/phone)
   - 3 duplicates merged
```

---

## Confidence Scoring Explained

Each extracted field gets a score 0-1:

```
0.95 (95%) = Very confident
  └─ Email regex match
  └─ Exact column name match
  └─ Standard format

0.70 (70%) = Somewhat confident
  └─ Partial pattern match
  └─ Context-based guess
  └─ Need user review

0.40 (40%) = Low confidence
  └─ Ambiguous column name
  └─ Multiple possible interpretations
  └─ User should definitely review
```

UI colors:
- 🟢 Green: >0.8 (high, trust it)
- 🟡 Yellow: 0.5-0.8 (medium, review it)
- 🔴 Red: <0.5 (low, fix it)

---

## Error Handling

### Case 1: Record has no email or phone
```
System: "This record has no way to contact them"
Action: Skip record
Reason: "No email or mobile number found"
```

### Case 2: Email format invalid
```
System: "This doesn't look like a valid email"
Action: Skip record
Reason: "Invalid email format"
```

### Case 3: Claude AI fails
```
System: "AI processing failed for this batch"
Action: Retry (up to 3 times)
Delay: Exponential backoff (1s, 2s, 4s)
If all fail: Mark records as failed
```

### Case 4: CSV too large
```
System: "Too many records to process in one go"
Action: Split into batches
Benefit: Prevents timeout, enables progress tracking
```

---

## Cost Explanation

You pay Claude based on tokens used:

```
Tokens ≈ words in input + words in output

Example:
Input record: 20 tokens
Claude processing: 100 tokens
Output: 30 tokens
Total: 150 tokens per record

Cost:
150 tokens × $0.015/1K tokens = $0.00225 per record

100 records × $0.00225 = $0.225 total
```

The tool shows estimated cost so you know what to expect.

---

## Security & Privacy

- ✅ CSVs processed immediately, not stored
- ✅ No data sent to external services except Claude API
- ✅ Claude API call uses your own API key
- ✅ Results shown only to you
- ✅ File size limit: 50MB

---

## Performance Tips

1. **Keep CSVs clean** - Fewer errors = faster processing
2. **Use standard column names** - Easier for AI to map
3. **Remove duplicates first** - Saves API calls
4. **Start with small test** - Try 100 records first
5. **Monitor token usage** - Watch estimated cost

---

## Common Questions

**Q: What if my CSV has 10,000 rows?**
A: System batches them (50 per batch). You'll see progress as each batch completes.

**Q: What if AI gets it wrong?**
A: You can review the mappings before processing. Low confidence scores will be highlighted.

**Q: How long does processing take?**
A: ~0.5 seconds per record. 100 records ≈ 50 seconds.

**Q: Can I cancel processing?**
A: Currently no - just refresh the page (partial results will be lost).

**Q: What if Claude API goes down?**
A: Processing stops. Your CSV is still there, you can retry when it's back up.

**Q: Can I deploy this myself?**
A: Yes! See SETUP.md for Docker and Vercel/Railway deployment.

---

## Next Steps

1. Follow SETUP.md to install
2. Get Claude API key from Anthropic
3. Start with sample CSVs in `tests/edge-cases/`
4. Test with your own CSVs
5. Deploy to production when ready

Enjoy! 🚀
