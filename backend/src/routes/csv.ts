import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { uploadMiddleware } from '../middleware/upload';
import { CSVParserService } from '../services/csvParser';
import { BatchProcessorService } from '../services/batchProcessor';
import { ColumnMapping, UploadResponse, ProgressEvent } from '../types';
import logger from '../utils/logger';

const router = Router();
const uploadSessions = new Map<string, any>();

router.post('/upload', uploadMiddleware.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const uploadId = uuidv4();
    logger.info(`Processing CSV upload: ${uploadId}`);

    const parsed = await CSVParserService.parseCSV(req.file.buffer as any);
    const preview = CSVParserService.getPreview(parsed.rows, 5);

    const detectedMappings: any = {};
    const headerPatterns: Record<string, string[]> = {
      name: ['name', 'full name', 'full_name', 'first name', 'firstname', 'lead name', 'contact name'],
      email: ['email', 'email address', 'email_address', 'contact email', 'e-mail', 'mail'],
      mobile_without_country_code: ['phone', 'mobile', 'phone number', 'mobile_number', 'cell', 'phone_number', 'phonenumber'],
      company: ['company', 'organization', 'company name', 'business', 'org', 'organization name'],
      city: ['city', 'town', 'location'],
      state: ['state', 'province', 'region'],
      country: ['country', 'nation'],
      lead_owner: ['owner', 'assigned to', 'assigned_to', 'sales person', 'representative'],
      crm_status: ['status', 'lead status', 'stage', 'lead stage'],
      created_at: ['created at', 'created_at', 'date', 'creation date', 'date created'],
      data_source: ['source', 'data source', 'origin', 'campaign', 'medium'],
      crm_note: ['notes', 'note', 'remarks', 'comments', 'description'],
    };

    parsed.headers.forEach((header) => {
      const lowerHeader = header.toLowerCase().trim();
      for (const [field, patterns] of Object.entries(headerPatterns)) {
        if (patterns.some(p => lowerHeader.includes(p))) {
          detectedMappings[header] = {
            targetField: field,
            confidence: patterns.some(p => p === lowerHeader) ? 0.95 : 0.7,
            reason: `Matched pattern: ${patterns.find(p => lowerHeader.includes(p))}`,
          };
          break;
        }
      }
    });

    uploadSessions.set(uploadId, {
      fileName: req.file.originalname,
      headers: parsed.headers,
      rows: parsed.rows,
      detectedMappings,
    });

    const response: UploadResponse = {
      uploadId,
      fileName: req.file.originalname,
      totalRows: parsed.rows.length,
      preview,
      detectedMappings,
      headers: parsed.headers,
    };

    res.json({ success: true, data: response });
  } catch (error) {
    next(error);
  }
});

router.post('/extract', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { uploadId, mappings } = req.body;

    if (!uploadId || !mappings) {
      return res.status(400).json({ success: false, message: 'Missing uploadId or mappings' });
    }

    const session = uploadSessions.get(uploadId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Upload session not found' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendEvent = (event: ProgressEvent) => {
      res.write(`event: ${event.type}\n`);
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    };

    try {
      const batchSize = parseInt(process.env.BATCH_SIZE || '50');
      const maxRetries = parseInt(process.env.MAX_RETRIES || '3');

      const result = await BatchProcessorService.processBatch(
        session.rows,
        mappings as ColumnMapping,
        {
          batchSize,
          maxRetries,
          onProgress: sendEvent,
        }
      );

      sendEvent({
        type: 'result',
        message: 'Processing complete',
        data: result,
      });

      sendEvent({
        type: 'complete',
        message: 'Import completed successfully',
      });
    } catch (error) {
      sendEvent({
        type: 'error',
        message: (error as Error).message,
      });
    }

    res.end();
  } catch (error) {
    next(error);
  }
});

export default router;
