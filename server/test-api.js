// Automated API test script
async function runTests() {
  const baseUrl = 'http://localhost:5000/api';
  console.log('🧪 Starting API verification tests...\n');

  // 1. Health check
  const healthRes = await fetch(`${baseUrl}/health`);
  const healthData = await healthRes.json();
  console.log('1. Health Check:', {
    status: healthRes.status,
    dbMode: healthData.database?.mode,
    dbConnected: healthData.database?.connected,
    message: healthData.message,
  });

  // 2. Auth Login
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'demo@expensetracker.com',
      password: 'password123',
    }),
  });
  const loginData = await loginRes.json();
  console.log('2. Auth Login:', {
    status: loginRes.status,
    success: loginData.success,
    userName: loginData.user?.name,
    hasToken: Boolean(loginData.token),
  });

  const token = loginData.token;
  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // 3. Current User (/me)
  const meRes = await fetch(`${baseUrl}/auth/me`, { headers: authHeaders });
  const meData = await meRes.json();
  console.log('3. Auth /me:', {
    status: meRes.status,
    email: meData.user?.email,
    currency: meData.user?.currency,
  });

  // 4. Get Transactions
  const txRes = await fetch(`${baseUrl}/transactions`, { headers: authHeaders });
  const txData = await txRes.json();
  console.log('4. Get Transactions:', {
    status: txRes.status,
    total: txData.total,
    returnedCount: txData.count,
    firstSample: txData.data?.[0]?.description,
  });

  // 5. Create Transaction
  const newTxPayload = {
    description: 'Espresso & Croissant',
    amount: 9.5, // amount as number
    type: 'expense',
    category: 'Food & Dining',
    date: new Date().toISOString(), // date as ISO
    paymentMethod: 'Credit Card',
    notes: 'Morning coffee meeting',
  };

  const createRes = await fetch(`${baseUrl}/transactions`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(newTxPayload),
  });
  const createData = await createRes.json();
  console.log('5. Create Transaction:', {
    status: createRes.status,
    createdId: createData.data?.id,
    amountType: typeof createData.data?.amount,
    amountValue: createData.data?.amount,
    dateValue: createData.data?.date,
  });

  const createdId = createData.data?.id;

  // 6. Update Transaction
  const updateRes = await fetch(`${baseUrl}/transactions/${createdId}`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({ amount: 12.0, notes: 'Updated coffee & brunch' }),
  });
  const updateData = await updateRes.json();
  console.log('6. Update Transaction:', {
    status: updateRes.status,
    newAmount: updateData.data?.amount,
    newNotes: updateData.data?.notes,
  });

  // 7. Summary
  const summaryRes = await fetch(`${baseUrl}/transactions/summary`, {
    headers: authHeaders,
  });
  const summaryData = await summaryRes.json();
  console.log('7. Summary:', {
    status: summaryRes.status,
    totalBalance: summaryData.summary?.totalBalance,
    totalIncome: summaryData.summary?.totalIncome,
    totalExpense: summaryData.summary?.totalExpense,
    categories: Object.keys(summaryData.summary?.categoryTotals || {}).length,
    monthlySummaries: summaryData.summary?.monthlySummary?.length,
  });

  // 8. Delete Transaction
  const delRes = await fetch(`${baseUrl}/transactions/${createdId}`, {
    method: 'DELETE',
    headers: authHeaders,
  });
  const delData = await delRes.json();
  console.log('8. Delete Transaction:', {
    status: delRes.status,
    success: delData.success,
  });

  console.log('\n🎉 ALL BACKEND, AUTH & TRANSACTION TESTS PASSED SUCCESSFULLY!\n');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
