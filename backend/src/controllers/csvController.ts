import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Readable } from 'stream';
import { CSVParserService } from '../services/csvParser';
import { BatchProcessorService } from '../services/batchProcessor';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { ColumnMapping, ProgressEvent } from '../types';
import logger from '../utils/logger';

const uploadSessions = new Map<string, any>();

export const csvController = {
  uploadCSV: asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError(400, 'No file uploaded');
    }

    try {
      const uploadId = uuidv4();
      const fileStream = Readable.from(req.file.buffer);

      const { headers, rows } = await CSVParserService.parseCSV(fileStream);

      if (rows.length === 0) {
        throw new AppError(400, 'CSV file is empty');
      }

      const preview = CSVParserService.getPreview(rows, 5);

      const detectedMappings: Record<string, any> = {};
      headers.forEach((header) => {
        const lowerHeader = header.toLowerCase();
        let targetField = 'description';
        let confidence = 0.3;
        let reason = 'Generic fallback';

        if (lowerHeader.includes('name')) {
          targetField = 'name';
          confidence = 0.9;
          reason = 'Header contains "name"';
        } else if (lowerHeader.includes('email')) {
          targetField = 'email';
          confidence = 0.95;
          reason = 'Header contains "email"';
        } else if (lowerHeader.includes('phone') || lowerHeader.includes('mobile') || lowerHeader.includes('cell')) {
          targetField = 'mobile_without_country_code';
          confidence = 0.9;
          reason = 'Header contains phone-like terms';
        } else if (lowerHeader.includes('company') || lowerHeader.includes('org')) {
          targetField = 'company';
          confidence = 0.85;
          reason = 'Header contains "company" or "org"';
        } else if (lowerHeader.includes('city')) {
          targetField = 'city';
          confidence = 0.88;
          reason = 'Header contains "city"';
        } else if (lowerHeader.includes('state') || lowerHeader.includes('province')) {
          targetField = 'state';
          confidence = 0.85;
          reason = 'Header contains "state" or "province"';
        } else if (lowerHeader.includes('country')) {
          targetField = 'country';
          confidence = 0.88;
          reason = 'Header contains "country"';
        } else if (lowerHeader.includes('status') || lowerHeader.includes('lead')) {
          targetField = 'crm_status';
          confidence = 0.7;
          reason = 'Header suggests status/lead field';
        }

        detectedMappings[header] = {
          targetField,
          confidence,
          reason,
        };
      });

      uploadSessions.set(uploadId, {
        fileName: req.file.originalname,
        headers,
        rows,
        uploadedAt: new Date(),
      });

      res.json({
        success: true,
        uploadId,
        fileName: req.file.originalname,
        totalRows: rows.length,
        preview,
        detectedMappings,
        headers,
      });
    } catch (error) {
      logger.error('Upload failed', { error });
      throw error;
    }
  }),

  extractRecords: asyncHandler(async (req: Request, res: Response) => {
    const { uploadId, mappings } = req.body;

    if (!uploadId) {
      throw new AppError(400, 'uploadId is required');
    }

    if (!mappings || typeof mappings !== 'object') {
      throw new AppError(400, 'mappings must be provided as an object');
    }

    const session = uploadSessions.get(uploadId);
    if (!session) {
      throw new AppError(404, 'Upload session not found');
    }

    // Set response headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendEvent = (event: ProgressEvent) => {
      res.write(`event: ${event.type}\n`);
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    };

    try {
      const batchSize = parseInt(process.env.BATCH_SIZE || '50', 10);
      const maxRetries = parseInt(process.env.MAX_RETRIES || '3', 10);

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
        type: 'stats',
        message: 'Processing complete',
        data: result.stats,
      });

      sendEvent({
        type: 'complete',
        message: 'Import completed successfully',
        data: {
          records: result.records,
          skipped: result.skipped,
          stats: result.stats,
        },
      });

      res.end();
    } catch (error) {
      logger.error('Extraction failed', { error, uploadId });
      sendEvent({
        type: 'error',
        message: `Extraction failed: ${(error as Error).message}`,
      });
      res.end();
    }
  }),
};
