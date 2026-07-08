import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export class CSVController {
  static async handleHealth(req: Request, res: Response) {
    res.json({ success: true, message: 'CSV Importer API is running' });
  }

  static async handleError(req: Request, res: Response) {
    res.status(404).json({ success: false, message: 'Endpoint not found' });
  }
}
