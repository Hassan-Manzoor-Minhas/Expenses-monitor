import express from 'express';
import {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
  importTransactions,
  seedTransactions,
} from '../controllers/transactionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All transaction routes are protected with JWT
router.use(protect);

router.route('/').get(getTransactions).post(createTransaction);
router.get('/summary', getTransactionSummary);
router.post('/import', importTransactions);
router.post('/seed', seedTransactions);
router.route('/:id').get(getTransactionById).put(updateTransaction).delete(deleteTransaction);

export default router;
