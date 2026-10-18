import {
  createTransaction as createTx,
  getTransactions as getTxList,
  getTransactionById as getTxById,
  updateTransaction as updateTx,
  deleteTransaction as deleteTx,
  deleteAllTransactions,
  seedDemoData,
} from '../services/dataStore.js';

const ALLOWED_TYPES = ['expense', 'income'];
const ALLOWED_PAYMENT_METHODS = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'Digital Wallet',
  'Other',
];

// @desc    Get all transactions with filtering, searching, and sorting
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const result = await getTxList(userId, req.query);

    res.status(200).json({
      success: true,
      count: result.transactions.length,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      data: result.transactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
export const getTransactionById = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const tx = await getTxById(req.params.id, userId);

    if (!tx) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    res.status(200).json({
      success: true,
      data: tx,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
export const createTransaction = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { description, amount, type, category, date, paymentMethod, notes, tags } = req.body;

    // Validate description
    if (!description || typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Description is required and cannot be empty',
      });
    }

    if (description.trim().length > 120) {
      return res.status(400).json({
        success: false,
        message: 'Description cannot exceed 120 characters',
      });
    }

    // Validate amount (must be positive number, no negatives, no NaN, no Infinity)
    if (amount === undefined || amount === null || amount === '') {
      return res.status(400).json({
        success: false,
        message: 'Amount is required',
      });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || !isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a valid positive number greater than 0',
      });
    }

    if (numericAmount > 1000000000) {
      return res.status(400).json({
        success: false,
        message: 'Amount exceeds maximum allowable limit of 1,000,000,000',
      });
    }

    // Validate type
    if (!type || !ALLOWED_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Type must be either 'expense' or 'income'`,
      });
    }

    // Validate category
    if (!category || typeof category !== 'string' || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category is required and cannot be empty',
      });
    }

    // Validate date
    const parsedDate = date ? new Date(date) : new Date();
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date provided. Must be a valid date format',
      });
    }

    // Payment method
    const safePaymentMethod =
      paymentMethod && ALLOWED_PAYMENT_METHODS.includes(paymentMethod)
        ? paymentMethod
        : 'Debit Card';

    // Notes & Tags
    const safeNotes = typeof notes === 'string' ? notes.trim().slice(0, 300) : '';
    const safeTags = Array.isArray(tags)
      ? tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean)
      : [];

    const newTx = await createTx({
      userId,
      description: description.trim(),
      amount: numericAmount, // store amount as number
      type,
      category: category.trim(),
      date: parsedDate.toISOString(), // store date as ISO date
      paymentMethod: safePaymentMethod,
      notes: safeNotes,
      tags: safeTags,
    });

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: newTx,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update existing transaction
// @route   PUT /api/transactions/:id
// @access  Private
export const updateTransaction = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    // Verify ownership and existence
    const existing = await getTxById(id, userId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    const { description, amount, type, category, date, paymentMethod, notes, tags } = req.body;
    const updates = {};

    if (description !== undefined) {
      if (typeof description !== 'string' || !description.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Description cannot be empty',
        });
      }
      if (description.trim().length > 120) {
        return res.status(400).json({
          success: false,
          message: 'Description cannot exceed 120 characters',
        });
      }
      updates.description = description.trim();
    }

    if (amount !== undefined) {
      const num = Number(amount);
      if (isNaN(num) || !isFinite(num) || num <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be a valid positive number greater than 0',
        });
      }
      if (num > 1000000000) {
        return res.status(400).json({
          success: false,
          message: 'Amount exceeds maximum allowable limit of 1,000,000,000',
        });
      }
      updates.amount = num;
    }

    if (type !== undefined) {
      if (!ALLOWED_TYPES.includes(type)) {
        return res.status(400).json({
          success: false,
          message: `Type must be either 'expense' or 'income'`,
        });
      }
      updates.type = type;
    }

    if (category !== undefined) {
      if (typeof category !== 'string' || !category.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Category cannot be empty',
        });
      }
      updates.category = category.trim();
    }

    if (date !== undefined) {
      const d = new Date(date);
      if (isNaN(d.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date provided',
        });
      }
      updates.date = d.toISOString();
    }

    if (paymentMethod !== undefined) {
      if (!ALLOWED_PAYMENT_METHODS.includes(paymentMethod)) {
        return res.status(400).json({
          success: false,
          message: `Invalid payment method. Allowed: ${ALLOWED_PAYMENT_METHODS.join(', ')}`,
        });
      }
      updates.paymentMethod = paymentMethod;
    }

    if (notes !== undefined) {
      updates.notes = typeof notes === 'string' ? notes.trim().slice(0, 300) : '';
    }

    if (tags !== undefined) {
      updates.tags = Array.isArray(tags)
        ? tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean)
        : [];
    }

    const updated = await updateTx(id, userId, updates);

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
export const deleteTransaction = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    const success = await deleteTx(id, userId);
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or already deleted',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
      data: { id },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get summary statistics
// @route   GET /api/transactions/summary
// @access  Private
export const getTransactionSummary = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const result = await getTxList(userId, { limit: 10000 });
    const all = result.transactions;

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryTotals = {};
    const monthlySummary = {};

    all.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      const txDate = new Date(tx.date);
      const monthKey = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlySummary[monthKey]) {
        monthlySummary[monthKey] = { income: 0, expense: 0, month: monthKey };
      }

      if (tx.type === 'income') {
        totalIncome += amt;
        monthlySummary[monthKey].income += amt;
      } else {
        totalExpense += amt;
        monthlySummary[monthKey].expense += amt;
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + amt;
      }
    });

    const netBalance = Math.round((totalIncome - totalExpense) * 100) / 100;
    totalIncome = Math.round(totalIncome * 100) / 100;
    totalExpense = Math.round(totalExpense * 100) / 100;
    const savingsRate =
      totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

    res.status(200).json({
      success: true,
      summary: {
        totalBalance: netBalance,
        totalIncome,
        totalExpense,
        savingsRate,
        transactionCount: all.length,
        categoryTotals,
        monthlySummary: Object.values(monthlySummary).sort((a, b) => a.month.localeCompare(b.month)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Batch import transactions
// @route   POST /api/transactions/import
// @access  Private
export const importTransactions = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { transactions } = req.body;

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Transactions must be a non-empty array',
      });
    }

    const imported = [];
    for (const item of transactions) {
      const amt = Number(item.amount);
      if (
        item.description &&
        String(item.description).trim() &&
        !isNaN(amt) &&
        amt > 0 &&
        item.category &&
        String(item.category).trim()
      ) {
        const created = await createTx({
          userId,
          description: String(item.description).trim().slice(0, 120),
          amount: amt,
          type: item.type === 'income' ? 'income' : 'expense',
          category: String(item.category).trim().slice(0, 50),
          date: item.date && !isNaN(new Date(item.date).getTime())
            ? new Date(item.date).toISOString()
            : new Date().toISOString(),
          paymentMethod: ALLOWED_PAYMENT_METHODS.includes(item.paymentMethod)
            ? item.paymentMethod
            : 'Debit Card',
          notes: item.notes ? String(item.notes).slice(0, 300) : '',
          tags: Array.isArray(item.tags) ? item.tags : [],
        });
        imported.push(created);
      }
    }

    res.status(201).json({
      success: true,
      message: `Successfully imported ${imported.length} transactions`,
      count: imported.length,
      data: imported,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset / re-seed demo transactions
// @route   POST /api/transactions/seed
// @access  Private
export const seedTransactions = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    await deleteAllTransactions(userId);
    await seedDemoData(userId);

    const result = await getTxList(userId, { limit: 100 });

    res.status(200).json({
      success: true,
      message: 'Demo transactions seeded successfully',
      count: result.transactions.length,
      data: result.transactions,
    });
  } catch (error) {
    next(error);
  }
};
