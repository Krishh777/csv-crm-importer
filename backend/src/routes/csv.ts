import { Router } from 'express';
import { upload } from '../middleware/upload';
import { csvController } from '../controllers/csvController';

const router = Router();

router.post('/upload', upload.single('file'), csvController.uploadCSV);
router.post('/extract', csvController.extractRecords);

export default router;
