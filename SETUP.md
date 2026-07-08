# Setup Instructions

## Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/Krishh777/csv-crm-importer.git
cd csv-crm-importer
```

### 2. Get Claude API Key
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or login
3. Click "API Keys" in the sidebar
4. Create a new key
5. Copy it (you'll use it in the next step)

### 3. Backend Setup
```bash
cd backend
cp .env.example .env
```

Edit `.env` and add your Claude API key:
```
CLAUDE_API_KEY=sk-ant-YOUR_KEY_HERE
CLAUDE_MODEL=claude-3-5-sonnet-20241022
NODE_ENV=development
PORT=3001
```

Then run:
```bash
npm install
npm run dev
```

Backend should now be running on `http://localhost:3001`

### 4. Frontend Setup (in another terminal)
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Frontend should now be running on `http://localhost:3000`

### 5. Open in Browser
Go to `http://localhost:3000` and start uploading CSVs!

---

## Docker Setup (Optional)

If you prefer Docker:

```bash
# Create .env file in root directory
echo "CLAUDE_API_KEY=sk-ant-YOUR_KEY_HERE" > .env

# Build and run
docker-compose up --build
```

Then access:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`

---

## How to Use

### Step 1: Upload CSV
- Click "Select File" or drag & drop a CSV file
- Wait for upload to complete

### Step 2: Preview Data
- See a sample of your CSV data
- Verify everything looks correct
- Click "Next" to continue

### Step 3: Review Mappings
- See AI-detected column mappings
- Yellow boxes = uncertain mappings (review these!)
- Green boxes = high confidence
- Manually change any incorrect mappings
- Click "Start Processing"

### Step 4: Processing
- Watch real-time progress
- Each batch is processed in parallel
- Failed batches are automatically retried

### Step 5: Results
- See successfully imported records
- See skipped records with reasons
- Download results as CSV
- View token usage and estimated cost

---

## Troubleshooting

### Backend won't start
- Check `CLAUDE_API_KEY` in `.env`
- Make sure port 3001 is free
- Run `npm install` again

### Frontend won't connect to backend
- Make sure backend is running on 3001
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Check browser console for errors

### CSV upload fails
- Make sure file is valid CSV format
- File size must be < 50MB
- Column headers should be in first row

### AI extraction is slow
- This is normal - Claude processes each record
- Larger CSVs with many columns take longer
- Token cost is based on file size

---

## Testing

### Run Backend Tests
```bash
cd backend
npm test
```

### Test with Sample CSVs
Sample CSV files are in `tests/edge-cases/` directory
- `merged-columns.csv` - Tests name and email extraction
- `excel-dates.csv` - Tests date format conversion
- `phone-only.csv` - Tests phone-only records
- `multiple-emails.csv` - Tests multiple email handling
- `real-estate.csv` - Tests real estate export format
- `facebook-leads.csv` - Tests Facebook lead export format

---

## Production Deployment

### Deploy to Vercel (Frontend)
```bash
vercel deploy frontend
```

### Deploy to Railway (Backend)
```bash
railway link
railway deploy
```

### Environment Variables (Production)

**Backend:**
- `CLAUDE_API_KEY` - Your Claude API key
- `NODE_ENV` - Set to "production"
- `PORT` - Port number (default 3001)
- `CLIENT_URL` - Frontend URL for CORS

**Frontend:**
- `NEXT_PUBLIC_API_URL` - Backend API URL

---

## Performance Tips

1. **Batch Size**: Larger batches = fewer API calls but slower response
2. **Retry Logic**: Failed batches are retried with exponential backoff
3. **Token Cost**: Monitor token usage in results to optimize costs
4. **Deduplication**: Duplicate records are automatically merged

---

## Architecture Overview

```
User Browser (Frontend)
    ↓
    Upload CSV
    ↓
    Preview Data
    ↓
    Confirm Mappings
    ↓
Backend Server
    ↓
    Parse CSV
    ↓
    Split into Batches
    ↓
    Call Claude AI (for each record)
    ↓
    Transform & Validate
    ↓
    Deduplicate
    ↓
    Send Results via SSE
    ↓
Display Results in Browser
```

---

## Key Features Explained

### Confidence Scoring
- Each extracted field has a confidence score (0-1)
- Green (>0.8) = High confidence
- Yellow (0.5-0.8) = Medium, review suggested
- Red (<0.5) = Low, likely needs manual fix

### Batch Processing
- CSV is split into batches (default 50 records)
- Each batch is processed separately
- Failed batches are retried automatically
- Progress is streamed in real-time

### Deduplication
- Detects duplicate leads by email or phone
- Keeps first occurrence, merges others
- Adds note explaining merge

### Token Cost Tracking
- Shows total tokens used
- Estimates API cost
- Helps monitor spending

---

## Support & Issues

If you encounter issues:
1. Check the error message
2. Review backend logs: `cat combined.log`
3. Check browser console: F12 → Console tab
4. Review sample CSVs in `tests/edge-cases/`

---

## License

MIT License - see LICENSE file
