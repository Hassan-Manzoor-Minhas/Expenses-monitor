import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserPreferences,
} from '../services/dataStore.js';

const VALID_CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'PKR',
  'INR',
  'AED',
  'SAR',
  'CAD',
  'AUD',
  'JPY',
  'CNY',
  'CHF',
  'SGD',
  'NZD',
  'BDT',
  'TRY',
  'BRL',
  'ZAR',
];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'super_secret_jwt_key_expense_tracker_2025_secure',
    { expiresIn: '30d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, currency } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required and cannot be empty',
      });
    }

    if (name.trim().length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Name cannot exceed 50 characters',
      });
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address (e.g. user@example.com)',
      });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Password is required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    if (password.length > 128) {
      return res.status(400).json({
        success: false,
        message: 'Password cannot exceed 128 characters',
      });
    }

    const selectedCurrency = currency ? currency.toUpperCase() : 'USD';
    if (!VALID_CURRENCIES.includes(selectedCurrency)) {
      return res.status(400).json({
        success: false,
        message: `Invalid currency. Allowed: ${VALID_CURRENCIES.join(', ')}`,
      });
    }

    // Check if user already exists
    const userExists = await findUserByEmail(normalizedEmail);
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with that email already exists',
      });
    }

    const user = await createUser({
      name: name.trim(),
      email: normalizedEmail,
      password,
      currency: selectedCurrency,
    });

    const token = generateToken(user._id || user.id);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        budgetLimit: user.budgetLimit,
        categoryBudgets: user.categoryBudgets,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address',
      });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Please provide your password',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Verify password using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id || user.id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        budgetLimit: user.budgetLimit,
        categoryBudgets: user.categoryBudgets,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await findUserById(req.user._id || req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found',
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        budgetLimit: user.budgetLimit,
        categoryBudgets: user.categoryBudgets,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user preferences (currency, budget)
// @route   PUT /api/auth/preferences
// @access  Private
export const updatePreferences = async (req, res, next) => {
  try {
    const { currency, budgetLimit, categoryBudgets } = req.body;
    const updates = {};

    if (currency) {
      const upper = String(currency).toUpperCase();
      if (!VALID_CURRENCIES.includes(upper)) {
        return res.status(400).json({
          success: false,
          message: `Invalid currency. Allowed: ${VALID_CURRENCIES.join(', ')}`,
        });
      }
      updates.currency = upper;
    }

    if (budgetLimit !== undefined) {
      const num = Number(budgetLimit);
      if (isNaN(num) || !isFinite(num) || num <= 0 || num > 100000000) {
        return res.status(400).json({
          success: false,
          message: 'Budget limit must be a positive number under 100,000,000',
        });
      }
      updates.budgetLimit = num;
    }

    if (categoryBudgets && typeof categoryBudgets === 'object') {
      updates.categoryBudgets = categoryBudgets;
    }

    const updated = await updateUserPreferences(req.user._id || req.user.id, updates);

    res.status(200).json({
      success: true,
      user: updated,
    });
  } catch (error) {
    next(error);
  }
};
