import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { dbState } from '../config/db.js';

// In-memory data structures for offline / fallback mode
const memoryUsers = new Map();
const memoryTransactions = new Map();

// Helper to generate simple random ID for memory records
const generateId = () => {
  return 'mem_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
};

// Seed realistic sample transactions for initial demo
export const seedDemoData = async (userId) => {
  const existingCount = Array.from(memoryTransactions.values()).filter(
    (t) => t.user === userId
  ).length;

  if (existingCount > 0) return;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const samples = [
    // Current month income & expenses
    {
      description: 'Monthly Salary - Tech Corp',
      amount: 4500.0,
      type: 'income',
      category: 'Salary',
      date: new Date(year, month, 1, 9, 30).toISOString(),
      paymentMethod: 'Bank Transfer',
      notes: 'Direct deposit for monthly compensation',
      tags: ['salary', 'career'],
    },
    {
      description: 'Freelance Web Design Project',
      amount: 850.0,
      type: 'income',
      category: 'Freelance',
      date: new Date(year, month, 12, 14, 0).toISOString(),
      paymentMethod: 'Digital Wallet',
      notes: 'Frontend UI design payment',
      tags: ['freelance', 'client'],
    },
    {
      description: 'Apartment Monthly Rent',
      amount: 1200.0,
      type: 'expense',
      category: 'Housing & Rent',
      date: new Date(year, month, 2, 10, 0).toISOString(),
      paymentMethod: 'Bank Transfer',
      notes: 'November rent payment',
      tags: ['rent', 'fixed'],
    },
    {
      description: 'Supermarket Grocery Haul',
      amount: 142.75,
      type: 'expense',
      category: 'Food & Dining',
      date: new Date(year, month, 4, 18, 15).toISOString(),
      paymentMethod: 'Credit Card',
      notes: 'Organic groceries and household supplies',
      tags: ['groceries', 'food'],
    },
    {
      description: 'Electric & Water Utilities',
      amount: 98.4,
      type: 'expense',
      category: 'Utilities',
      date: new Date(year, month, 6, 11, 20).toISOString(),
      paymentMethod: 'Debit Card',
      notes: 'Monthly power and water bill',
      tags: ['bills'],
    },
    {
      description: 'Italian Dinner with Friends',
      amount: 68.5,
      type: 'expense',
      category: 'Food & Dining',
      date: new Date(year, month, 8, 20, 30).toISOString(),
      paymentMethod: 'Credit Card',
      notes: 'Dinner at Trattoria Bella',
      tags: ['dining', 'weekend'],
    },
    {
      description: 'Gasoline Fill-Up',
      amount: 52.0,
      type: 'expense',
      category: 'Transportation',
      date: new Date(year, month, 10, 16, 45).toISOString(),
      paymentMethod: 'Debit Card',
      notes: 'Full tank at Shell',
      tags: ['gas', 'car'],
    },
    {
      description: 'Gym & Fitness Membership',
      amount: 45.0,
      type: 'expense',
      category: 'Healthcare',
      date: new Date(year, month, 11, 8, 0).toISOString(),
      paymentMethod: 'Debit Card',
      notes: 'Monthly gym subscription',
      tags: ['fitness', 'health'],
    },
    {
      description: 'Streaming & Media Subscriptions',
      amount: 32.98,
      type: 'expense',
      category: 'Entertainment',
      date: new Date(year, month, 13, 12, 0).toISOString(),
      paymentMethod: 'Credit Card',
      notes: 'Netflix and Spotify Family',
      tags: ['subscriptions'],
    },
    {
      description: 'Ergonomic Desk Accessories',
      amount: 119.99,
      type: 'expense',
      category: 'Shopping',
      date: new Date(year, month, 15, 15, 10).toISOString(),
      paymentMethod: 'Credit Card',
      notes: 'Monitor arm and wrist rest',
      tags: ['office', 'hardware'],
    },
    // Previous month transactions for rich multi-month chart visualization
    {
      description: 'Previous Month Salary',
      amount: 4500.0,
      type: 'income',
      category: 'Salary',
      date: new Date(year, month - 1, 1, 9, 30).toISOString(),
      paymentMethod: 'Bank Transfer',
      notes: 'Direct deposit',
      tags: ['salary'],
    },
    {
      description: 'Freelance Consulting',
      amount: 600.0,
      type: 'income',
      category: 'Freelance',
      date: new Date(year, month - 1, 14, 11, 0).toISOString(),
      paymentMethod: 'Digital Wallet',
      notes: 'Tech consultation',
      tags: ['freelance'],
    },
    {
      description: 'Apartment Rent',
      amount: 1200.0,
      type: 'expense',
      category: 'Housing & Rent',
      date: new Date(year, month - 1, 2, 10, 0).toISOString(),
      paymentMethod: 'Bank Transfer',
      notes: 'Previous month rent',
      tags: ['rent'],
    },
    {
      description: 'Grocery Shopping',
      amount: 185.3,
      type: 'expense',
      category: 'Food & Dining',
      date: new Date(year, month - 1, 5, 17, 0).toISOString(),
      paymentMethod: 'Credit Card',
      notes: 'Costco bulk food run',
      tags: ['groceries'],
    },
    {
      description: 'Internet & Mobile Plan',
      amount: 85.0,
      type: 'expense',
      category: 'Utilities',
      date: new Date(year, month - 1, 9, 13, 0).toISOString(),
      paymentMethod: 'Debit Card',
      notes: 'Fiber optics & 5G plan',
      tags: ['bills'],
    },
    {
      description: 'Concert Tickets',
      amount: 95.0,
      type: 'expense',
      category: 'Entertainment',
      date: new Date(year, month - 1, 18, 19, 0).toISOString(),
      paymentMethod: 'Credit Card',
      notes: 'Live acoustic music festival',
      tags: ['concert', 'fun'],
    },
    // Two months ago transactions
    {
      description: 'Two Months Ago Salary',
      amount: 4500.0,
      type: 'income',
      category: 'Salary',
      date: new Date(year, month - 2, 1, 9, 30).toISOString(),
      paymentMethod: 'Bank Transfer',
      notes: 'Salary deposit',
      tags: ['salary'],
    },
    {
      description: 'Stock Dividend Payout',
      amount: 140.0,
      type: 'income',
      category: 'Investment',
      date: new Date(year, month - 2, 15, 10, 0).toISOString(),
      paymentMethod: 'Bank Transfer',
      notes: 'Quarterly index fund dividend',
      tags: ['dividend'],
    },
    {
      description: 'Apartment Rent',
      amount: 1200.0,
      type: 'expense',
      category: 'Housing & Rent',
      date: new Date(year, month - 2, 2, 10, 0).toISOString(),
      paymentMethod: 'Bank Transfer',
      notes: 'Rent payment',
      tags: ['rent'],
    },
    {
      description: 'Car Service & Oil Change',
      amount: 135.0,
      type: 'expense',
      category: 'Transportation',
      date: new Date(year, month - 2, 12, 11, 0).toISOString(),
      paymentMethod: 'Credit Card',
      notes: 'Scheduled auto maintenance',
      tags: ['car'],
    },
  ];

  for (const sample of samples) {
    if (dbState.connected) {
      await Transaction.create({ ...sample, user: userId });
    } else {
      const id = generateId();
      memoryTransactions.set(id, {
        _id: id,
        id,
        user: userId,
        ...sample,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }
};

// Seed default demo user in memory or MongoDB so user can test immediately
export const initMemoryStore = async () => {
  const demoEmail = 'demo@expensetracker.com';

  if (dbState.connected) {
    try {
      let mongoDemoUser = await User.findOne({ email: demoEmail });
      if (!mongoDemoUser) {
        mongoDemoUser = await User.create({
          name: 'Alex Morgan',
          email: demoEmail,
          password: 'password123',
          currency: 'USD',
          budgetLimit: 2500,
        });
        await seedDemoData(mongoDemoUser._id.toString());
      }
    } catch (err) {
      console.warn('Could not auto-seed demo user in MongoDB:', err.message);
    }
  }

  let demoUser = Array.from(memoryUsers.values()).find((u) => u.email === demoEmail);

  if (!demoUser) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    const userId = 'mem_demo_user_001';

    demoUser = {
      _id: userId,
      id: userId,
      name: 'Alex Morgan',
      email: demoEmail,
      password: hashedPassword,
      currency: 'USD',
      budgetLimit: 2500,
      categoryBudgets: {
        'Food & Dining': 500,
        'Housing & Rent': 1200,
        'Transportation': 250,
        'Utilities': 200,
        'Entertainment': 150,
        'Shopping': 200,
        'Healthcare': 100,
        'Other': 100,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    memoryUsers.set(userId, demoUser);
    await seedDemoData(userId);
  }
};

// ================= USER OPERATIONS =================
export const findUserByEmail = async (email) => {
  const normalized = email.trim().toLowerCase();
  if (dbState.connected) {
    return await User.findOne({ email: normalized }).select('+password');
  }
  return (
    Array.from(memoryUsers.values()).find((u) => u.email.toLowerCase() === normalized) || null
  );
};

export const findUserById = async (id) => {
  if (dbState.connected) {
    return await User.findById(id).select('-password');
  }
  const u = memoryUsers.get(id);
  if (!u) return null;
  const { password, ...safeUser } = u;
  return safeUser;
};

export const createUser = async ({ name, email, password, currency = 'USD' }) => {
  const normalized = email.trim().toLowerCase();
  if (dbState.connected) {
    const user = await User.create({ name, email: normalized, password, currency });
    return {
      _id: user._id.toString(),
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      currency: user.currency,
      budgetLimit: user.budgetLimit,
      categoryBudgets: user.categoryBudgets,
    };
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const id = generateId();

  const newUser = {
    _id: id,
    id,
    name: name.trim(),
    email: normalized,
    password: hashedPassword,
    currency,
    budgetLimit: 2500,
    categoryBudgets: {
      'Food & Dining': 500,
      'Housing & Rent': 1000,
      'Transportation': 250,
      'Utilities': 200,
      'Entertainment': 150,
      'Shopping': 200,
      'Healthcare': 100,
      'Other': 100,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  memoryUsers.set(id, newUser);
  // Auto-seed sample transactions so new accounts have ready-to-test data
  await seedDemoData(id);

  const { password: _, ...safeUser } = newUser;
  return safeUser;
};

export const updateUserPreferences = async (id, updates) => {
  if (dbState.connected) {
    return await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
  }
  const user = memoryUsers.get(id);
  if (!user) return null;
  const updated = {
    ...user,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  memoryUsers.set(id, updated);
  const { password, ...safe } = updated;
  return safe;
};

// ================= TRANSACTION OPERATIONS =================
export const createTransaction = async ({
  userId,
  description,
  amount,
  type,
  category,
  date,
  paymentMethod = 'Debit Card',
  notes = '',
  tags = [],
}) => {
  // Store amounts as numbers and dates as ISO dates
  const numericAmount = Math.round(Number(amount) * 100) / 100;
  const isoDate = date ? new Date(date).toISOString() : new Date().toISOString();

  if (dbState.connected) {
    const created = await Transaction.create({
      user: userId,
      description: description.trim(),
      amount: numericAmount,
      type,
      category: category.trim(),
      date: isoDate,
      paymentMethod,
      notes: notes || '',
      tags: Array.isArray(tags) ? tags : [],
    });
    return created.toJSON();
  }

  const id = generateId();
  const newTx = {
    _id: id,
    id,
    user: userId,
    description: description.trim(),
    amount: numericAmount, // stored as number
    type,
    category: category.trim(),
    date: isoDate, // stored as ISO date
    paymentMethod,
    notes: notes || '',
    tags: Array.isArray(tags) ? tags : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  memoryTransactions.set(id, newTx);
  return newTx;
};

export const getTransactions = async (userId, query = {}) => {
  const {
    type,
    category,
    startDate,
    endDate,
    search,
    minAmount,
    maxAmount,
    sortBy = 'date',
    sortOrder = 'desc',
    page = 1,
    limit = 100,
  } = query;

  if (dbState.connected) {
    const filter = { user: userId };
    if (type && type !== 'all') filter.type = type;
    if (category && category !== 'all') filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (minAmount !== undefined && minAmount !== '') {
      filter.amount = filter.amount || {};
      filter.amount.$gte = Number(minAmount);
    }
    if (maxAmount !== undefined && maxAmount !== '') {
      filter.amount = filter.amount || {};
      filter.amount.$lte = Number(maxAmount);
    }
    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ description: regex }, { category: regex }, { notes: regex }];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const total = await Transaction.countDocuments(filter);
    const items = await Transaction.find(filter)
      .sort(sortOptions)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    return {
      transactions: items.map((t) => t.toJSON()),
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)) || 1,
    };
  }

  // Memory filtering
  let list = Array.from(memoryTransactions.values()).filter((t) => t.user === userId);

  if (type && type !== 'all') {
    list = list.filter((t) => t.type === type);
  }
  if (category && category !== 'all') {
    list = list.filter((t) => t.category.toLowerCase() === category.toLowerCase());
  }
  if (startDate) {
    const start = new Date(startDate).getTime();
    list = list.filter((t) => new Date(t.date).getTime() >= start);
  }
  if (endDate) {
    const end = new Date(endDate).getTime();
    list = list.filter((t) => new Date(t.date).getTime() <= end);
  }
  if (minAmount !== undefined && minAmount !== '') {
    list = list.filter((t) => t.amount >= Number(minAmount));
  }
  if (maxAmount !== undefined && maxAmount !== '') {
    list = list.filter((t) => t.amount <= Number(maxAmount));
  }
  if (search && search.trim() !== '') {
    const s = search.trim().toLowerCase();
    list = list.filter(
      (t) =>
        t.description.toLowerCase().includes(s) ||
        t.category.toLowerCase().includes(s) ||
        (t.notes && t.notes.toLowerCase().includes(s))
    );
  }

  // Sort
  list.sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    if (sortBy === 'date') {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }
    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    }
    return aVal < bVal ? 1 : -1;
  });

  const total = list.length;
  const p = Number(page);
  const l = Number(limit);
  const paginated = list.slice((p - 1) * l, p * l);

  return {
    transactions: paginated,
    total,
    page: p,
    totalPages: Math.ceil(total / l) || 1,
  };
};

export const getTransactionById = async (id, userId) => {
  if (dbState.connected) {
    const tx = await Transaction.findOne({ _id: id, user: userId });
    return tx ? tx.toJSON() : null;
  }
  const tx = memoryTransactions.get(id);
  if (!tx || tx.user !== userId) return null;
  return tx;
};

export const updateTransaction = async (id, userId, updates) => {
  const safeUpdates = { ...updates };
  if (safeUpdates.amount !== undefined) {
    safeUpdates.amount = Math.round(Number(safeUpdates.amount) * 100) / 100;
  }
  if (safeUpdates.date) {
    safeUpdates.date = new Date(safeUpdates.date).toISOString();
  }

  if (dbState.connected) {
    const updated = await Transaction.findOneAndUpdate(
      { _id: id, user: userId },
      safeUpdates,
      { new: true, runValidators: true }
    );
    return updated ? updated.toJSON() : null;
  }

  const existing = memoryTransactions.get(id);
  if (!existing || existing.user !== userId) return null;

  const modified = {
    ...existing,
    ...safeUpdates,
    updatedAt: new Date().toISOString(),
  };
  memoryTransactions.set(id, modified);
  return modified;
};

export const deleteTransaction = async (id, userId) => {
  if (dbState.connected) {
    const deleted = await Transaction.findOneAndDelete({ _id: id, user: userId });
    return !!deleted;
  }
  const existing = memoryTransactions.get(id);
  if (!existing || existing.user !== userId) return false;
  return memoryTransactions.delete(id);
};

export const deleteAllTransactions = async (userId) => {
  if (dbState.connected) {
    await Transaction.deleteMany({ user: userId });
    return true;
  }
  for (const [id, tx] of memoryTransactions.entries()) {
    if (tx.user === userId) {
      memoryTransactions.delete(id);
    }
  }
  return true;
};
