import { Readable } from 'stream';
import csvParser from 'csv-parser';
import logger from '../utils/logger';

export interface ParsedCSVData {
  headers: string[];
  rows: Record<string, any>[];
}

export class CSVParserService {
  static async parseCSV(fileStream: Readable): Promise<ParsedCSVData> {
    return new Promise((resolve, reject) => {
      const rows: Record<string, any>[] = [];
      let headers: string[] = [];

      fileStream
        .pipe(csvParser())
        .on('headers', (parsedHeaders: string[]) => {
          headers = parsedHeaders;
          logger.info(`Parsed CSV headers: ${headers.join(', ')}`);
        })
        .on('data', (row: Record<string, any>) => {
          const hasData = Object.values(row).some(v => v !== null && v !== '' && v !== undefined);
          if (hasData) {
            rows.push(row);
          }
        })
        .on('end', () => {
          logger.info(`CSV parsing complete: ${rows.length} rows`);
          resolve({ headers, rows });
        })
        .on('error', (error) => {
          logger.error('CSV parsing error', { error });
          reject(new Error(`Failed to parse CSV: ${error.message}`));
        });
    });
  }

  static getPreview(rows: Record<string, any>[], limit: number = 5): Record<string, any>[] {
    return rows.slice(0, limit);
  }
}
