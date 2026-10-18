// Category colors for rich visual UI and charts
export const CATEGORY_COLORS = {
  'Food & Dining': '#f59e0b', // Amber
  'Housing & Rent': '#6366f1', // Indigo
  'Transportation': '#06b6d4', // Cyan
  'Utilities': '#3b82f6', // Blue
  'Entertainment': '#ec4899', // Pink
  'Shopping': '#a855f7', // Purple
  'Healthcare': '#10b981', // Emerald
  'Salary': '#22c55e', // Green
  'Freelance': '#14b8a6', // Teal
  'Investment': '#8b5cf6', // Violet
  'Other': '#64748b', // Slate
};

// Fallback palette generator for arbitrary custom categories
export const getCategoryColor = (category) => {
  if (CATEGORY_COLORS[category]) return CATEGORY_COLORS[category];
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 55%)`;
};

/**
 * Group transactions by month ON THE FRONTEND
 * Required: "Group chart data by month on the frontend."
 *
 * @param {Array} transactions
 * @param {number} maxMonths - Limit to last N months (default: 12)
 * @returns {Array} Array of monthly aggregated records
 */
export const groupTransactionsByMonth = (transactions = [], maxMonths = 12) => {
  const monthMap = {};

  transactions.forEach((tx) => {
    if (!tx.date) return;
    const d = new Date(tx.date);
    if (isNaN(d.getTime())) return;

    // ISO-based month key: YYYY-MM
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const key = `${year}-${month}`;

    const monthLabel = d.toLocaleDateString('en-US', {
      month: 'short',
      year: '2-digit',
    });

    if (!monthMap[key]) {
      monthMap[key] = {
        key,
        label: monthLabel,
        year,
        monthIndex: d.getMonth(),
        income: 0,
        expense: 0,
        net: 0,
        count: 0,
      };
    }

    const amt = Number(tx.amount) || 0;
    if (tx.type === 'income') {
      monthMap[key].income += amt;
    } else {
      monthMap[key].expense += amt;
    }
    monthMap[key].count += 1;
  });

  // Sort chronologically ascending
  const sortedMonths = Object.values(monthMap).sort((a, b) =>
    a.key.localeCompare(b.key)
  );

  // Round amounts to 2 decimal places and calculate net
  const processed = sortedMonths.map((m) => ({
    ...m,
    income: Math.round(m.income * 100) / 100,
    expense: Math.round(m.expense * 100) / 100,
    net: Math.round((m.income - m.expense) * 100) / 100,
  }));

  if (maxMonths && processed.length > maxMonths) {
    return processed.slice(processed.length - maxMonths);
  }

  return processed;
};

/**
 * Group expenses by category for pie/doughnut breakdown
 */
export const groupExpensesByCategory = (transactions = []) => {
  const categoryMap = {};
  let totalExpense = 0;

  transactions
    .filter((tx) => tx.type === 'expense')
    .forEach((tx) => {
      const cat = tx.category || 'Other';
      const amt = Number(tx.amount) || 0;
      categoryMap[cat] = (categoryMap[cat] || 0) + amt;
      totalExpense += amt;
    });

  const categories = Object.entries(categoryMap).map(([category, amount]) => {
    const rounded = Math.round(amount * 100) / 100;
    const percentage = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
    return {
      category,
      amount: rounded,
      percentage,
      color: getCategoryColor(category),
    };
  });

  // Sort by highest spending first
  return categories.sort((a, b) => b.amount - a.amount);
};
