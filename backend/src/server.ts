import express, { Request, Response } from 'express';
import cors from 'cors';
import csvRoutes from './routes/csv';
import { errorHandler } from './middleware/errorHandler';
import logger from './utils/logger';
import { CSVController } from './controllers/csvController';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/health', CSVController.handleHealth);
app.use('/api/csv', csvRoutes);

// Error handling
app.use(errorHandler);
app.use((req: Request, res: Response) => {
  CSVController.handleError(req, res);
});

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`CSV Importer API running on port ${PORT}`);
  });
}

export default app;
