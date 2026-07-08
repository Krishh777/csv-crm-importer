import { AIExtractorService } from './aiExtractor';
import { CRMRecord, SkippedRecord, ColumnMapping, TokenUsage, ProgressEvent } from '../types';
import logger from '../utils/logger';
import { Deduplicator } from '../utils/deduplicator';

interface BatchProcessingOptions {
  batchSize: number;
  maxRetries: number;
  onProgress?: (event: ProgressEvent) => void;
}

interface ProcessingStats {
  totalRecords: number;
  successfulRecords: number;
  skippedRecords: number;
  failedRecords: number;
  totalTokensUsed: number;
  estimatedCost: string;
  duplicatesMerged: number;
  processingTimeMs: number;
}

export class BatchProcessorService {
  static async processBatch(
    csvRecords: Record<string, any>[],
    columnMapping: ColumnMapping,
    options: BatchProcessingOptions
  ): Promise<{
    records: CRMRecord[];
    skipped: SkippedRecord[];
    stats: ProcessingStats;
  }> {
    const startTime = Date.now();
    const { batchSize, maxRetries, onProgress } = options;
    const totalBatches = Math.ceil(csvRecords.length / batchSize);

    const successfulRecords: CRMRecord[] = [];
    const skippedRecords: SkippedRecord[] = [];
    let totalTokensUsed = 0;
    let failedCount = 0;

    logger.info(`Starting batch processing: ${csvRecords.length} records in ${totalBatches} batches`);

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const start = batchIndex * batchSize;
      const end = Math.min(start + batchSize, csvRecords.length);
      const batchRecords = csvRecords.slice(start, end);

      const batchResult = await this.processBatchWithRetry(
        batchRecords,
        columnMapping,
        batchIndex + 1,
        totalBatches,
        maxRetries,
        onProgress
      );

      successfulRecords.push(...batchResult.successful);
      skippedRecords.push(...batchResult.skipped);
      totalTokensUsed += batchResult.tokensUsed;
      failedCount += batchResult.failedCount;

      if (onProgress) {
        onProgress({
          type: 'batch_complete',
          batch: batchIndex + 1,
          total: totalBatches,
          message: `Batch ${batchIndex + 1} of ${totalBatches} complete`,
          data: {
            recordsProcessed: batchResult.successful.length + batchResult.skipped.length,
            tokensUsed: batchResult.tokensUsed,
          },
        });
      }
    }

    const deduplicatorResult = Deduplicator.deduplicateRecords(successfulRecords);
    const finalRecords = deduplicatorResult.records;
    const duplicatesMerged = deduplicatorResult.mergedCount;

    const estimatedCost = (totalTokensUsed * 0.000015).toFixed(4);

    const stats: ProcessingStats = {
      totalRecords: csvRecords.length,
      successfulRecords: finalRecords.length,
      skippedRecords: skippedRecords.length,
      failedRecords: failedCount,
      totalTokensUsed,
      estimatedCost: `$${estimatedCost}`,
      duplicatesMerged,
      processingTimeMs: Date.now() - startTime,
    };

    logger.info('Batch processing complete', stats);

    return {
      records: finalRecords,
      skipped: skippedRecords,
      stats,
    };
  }

  private static async processBatchWithRetry(
    batchRecords: Record<string, any>[],
    columnMapping: ColumnMapping,
    batchNumber: number,
    totalBatches: number,
    maxRetries: number,
    onProgress?: (event: ProgressEvent) => void
  ): Promise<{
    successful: CRMRecord[];
    skipped: SkippedRecord[];
    tokensUsed: number;
    failedCount: number;
  }> {
    let retryCount = 0;
    let lastError: Error | null = null;

    while (retryCount <= maxRetries) {
      try {
        if (onProgress && retryCount > 0) {
          onProgress({
            type: 'progress',
            batch: batchNumber,
            total: totalBatches,
            status: 'retrying',
            message: `Processing batch ${batchNumber} of ${totalBatches} (retry ${retryCount}/${maxRetries})...`,
          });
        } else if (onProgress) {
          onProgress({
            type: 'progress',
            batch: batchNumber,
            total: totalBatches,
            status: 'processing',
            message: `Processing batch ${batchNumber} of ${totalBatches}...`,
          });
        }

        const result = await this.processRecordsBatch(batchRecords, columnMapping);
        return result;
      } catch (error) {
        lastError = error as Error;
        retryCount++;

        if (retryCount <= maxRetries) {
          const delay = Math.pow(2, retryCount - 1) * 1000;
          logger.warn(`Batch ${batchNumber} failed, retrying in ${delay}ms...`, { error });
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    logger.error(`Batch ${batchNumber} failed after ${maxRetries} retries`, { error: lastError });
    return {
      successful: [],
      skipped: batchRecords.map((record, index) => ({
        rowIndex: index,
        data: record,
        reason: `Failed to process after ${maxRetries} retries: ${lastError?.message || 'Unknown error'}`,
      })),
      tokensUsed: 0,
      failedCount: batchRecords.length,
    };
  }

  private static async processRecordsBatch(
    batchRecords: Record<string, any>[],
    columnMapping: ColumnMapping
  ): Promise<{
    successful: CRMRecord[];
    skipped: SkippedRecord[];
    tokensUsed: number;
    failedCount: number;
  }> {
    const successful: CRMRecord[] = [];
    const skipped: SkippedRecord[] = [];
    let tokensUsed = 0;
    let failedCount = 0;

    for (let i = 0; i < batchRecords.length; i++) {
      try {
        const result = await AIExtractorService.extractRecord(batchRecords[i], columnMapping);
        tokensUsed += result.tokenUsage.totalTokens;

        if (result.shouldSkip) {
          skipped.push({
            rowIndex: i,
            data: batchRecords[i],
            reason: result.skipReason || 'Record skipped by AI',
          });
        } else if (result.record) {
          successful.push(result.record);
        }
      } catch (error) {
        logger.error(`Error processing record ${i}`, { error });
        failedCount++;
        skipped.push({
          rowIndex: i,
          data: batchRecords[i],
          reason: `Processing error: ${(error as Error).message}`,
        });
      }
    }

    return { successful, skipped, tokensUsed, failedCount };
  }
}
