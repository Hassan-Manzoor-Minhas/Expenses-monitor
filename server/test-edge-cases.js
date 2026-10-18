// Comprehensive Edge Cases and Security Test Suite
import jwt from 'jsonwebtoken';

const BASE_URL = 'http://localhost:5000/api';

async function testEdgeCases() {
  console.log('🛡️  STARTING SENIOR QA AUDIT: EDGE CASES & SECURITY TESTS\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} - ${details}`);
      failed++;
    }
  }

  // ==========================================
  // 1. AUTH REGISTRATION EDGE CASES
  // ==========================================
  console.log('\n--- 1. Auth Registration Edge Cases ---');

  // 1.1 Empty name
  let res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: '   ', email: 'valid1@test.com', password: 'password123' }),
  });
  assert(res.status === 400, 'Register with whitespace name returns 400');

  // 1.2 Empty email
  res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'John Doe', email: '   ', password: 'password123' }),
  });
  assert(res.status === 400, 'Register with empty email returns 400');

  // 1.3 Malformed email
  res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'John Doe', email: 'invalid-email-no-at', password: 'password123' }),
  });
  assert(res.status === 400, 'Register with invalid email format returns 400');

  // 1.4 Short password (< 6 chars)
  res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'John Doe', email: 'valid2@test.com', password: '123' }),
  });
  assert(res.status === 400, 'Register with short password returns 400');

  // 1.5 Duplicate email registration
  const uniqueEmail = `auditor_${Date.now()}@example.com`;
  res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'First User', email: uniqueEmail, password: 'password123' }),
  });
  const user1Data = await res.json();
  assert(res.status === 201 && user1Data.success, 'First user registration succeeds with 201');
  const user1Token = user1Data.token;

  // Attempt duplicate registration
  res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Imposter User', email: uniqueEmail, password: 'password123' }),
  });
  assert(res.status === 400, 'Duplicate email registration returns 400');

  // ==========================================
  // 2. AUTH LOGIN & TOKEN SECURITY
  // ==========================================
  console.log('\n--- 2. Auth Login & Token Security ---');

  // 2.1 Login with wrong password
  res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: uniqueEmail, password: 'wrongpassword' }),
  });
  assert(res.status === 401, 'Login with wrong password returns 401');

  // 2.2 Login with non-existent email
  res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ghost_user@doesnotexist.com', password: 'password123' }),
  });
  assert(res.status === 401, 'Login with non-existent email returns 401');

  // 2.3 Access protected route without token
  res = await fetch(`${BASE_URL}/transactions`);
  assert(res.status === 401, 'Access protected route without Authorization header returns 401');

  // 2.4 Access protected route with malformed token
  res = await fetch(`${BASE_URL}/transactions`, {
    headers: { Authorization: 'Bearer totally_invalid_jwt_gibberish_string' },
  });
  assert(res.status === 401, 'Access protected route with invalid JWT string returns 401');

  // 2.5 Access protected route with expired token
  const expiredToken = jwt.sign(
    { id: user1Data.user.id },
    'super_secret_jwt_key_expense_tracker_2025_secure',
    { expiresIn: '0s' }
  );
  res = await fetch(`${BASE_URL}/transactions`, {
    headers: { Authorization: `Bearer ${expiredToken}` },
  });
  assert(res.status === 401, 'Access protected route with expired token returns 401');

  // ==========================================
  // 3. TRANSACTION VALIDATION & EDGE CASES
  // ==========================================
  console.log('\n--- 3. Transaction Validation & Edge Cases ---');
  const u1Headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${user1Token}`,
  };

  // 3.1 Negative amount
  res = await fetch(`${BASE_URL}/transactions`, {
    method: 'POST',
    headers: u1Headers,
    body: JSON.stringify({
      description: 'Illegal Negative Transaction',
      amount: -50.0,
      type: 'expense',
      category: 'Food & Dining',
    }),
  });
  assert(res.status === 400, 'Create transaction with negative amount returns 400');

  // 3.2 Zero amount
  res = await fetch(`${BASE_URL}/transactions`, {
    method: 'POST',
    headers: u1Headers,
    body: JSON.stringify({
      description: 'Zero Amount Transaction',
      amount: 0,
      type: 'expense',
      category: 'Food & Dining',
    }),
  });
  assert(res.status === 400, 'Create transaction with zero amount returns 400');

  // 3.3 Non-numeric string amount
  res = await fetch(`${BASE_URL}/transactions`, {
    method: 'POST',
    headers: u1Headers,
    body: JSON.stringify({
      description: 'String Amount Transaction',
      amount: 'not_a_number',
      type: 'expense',
      category: 'Food & Dining',
    }),
  });
  assert(res.status === 400, 'Create transaction with non-numeric amount returns 400');

  // 3.4 Missing description
  res = await fetch(`${BASE_URL}/transactions`, {
    method: 'POST',
    headers: u1Headers,
    body: JSON.stringify({
      description: '   ',
      amount: 100,
      type: 'expense',
      category: 'Food & Dining',
    }),
  });
  assert(res.status === 400, 'Create transaction with empty description returns 400');

  // 3.5 Invalid type
  res = await fetch(`${BASE_URL}/transactions`, {
    method: 'POST',
    headers: u1Headers,
    body: JSON.stringify({
      description: 'Invalid Type',
      amount: 100,
      type: 'transfer',
      category: 'Food & Dining',
    }),
  });
  assert(res.status === 400, 'Create transaction with invalid type returns 400');

  // 3.6 Invalid date
  res = await fetch(`${BASE_URL}/transactions`, {
    method: 'POST',
    headers: u1Headers,
    body: JSON.stringify({
      description: 'Invalid Date',
      amount: 100,
      type: 'expense',
      category: 'Food & Dining',
      date: 'not-a-valid-date-string',
    }),
  });
  assert(res.status === 400, 'Create transaction with invalid date returns 400');

  // 3.7 Valid transaction creation
  res = await fetch(`${BASE_URL}/transactions`, {
    method: 'POST',
    headers: u1Headers,
    body: JSON.stringify({
      description: "User 1's Private Vault Transaction",
      amount: 750.5,
      type: 'income',
      category: 'Salary',
      date: new Date().toISOString(),
      paymentMethod: 'Bank Transfer',
      notes: 'Confidential salary payment',
    }),
  });
  const createdTx = await res.json();
  assert(res.status === 201 && createdTx.data?.id, 'Create valid transaction succeeds with 201');
  const user1TxId = createdTx.data?.id;

  // 3.8 Update with negative amount
  res = await fetch(`${BASE_URL}/transactions/${user1TxId}`, {
    method: 'PUT',
    headers: u1Headers,
    body: JSON.stringify({ amount: -100 }),
  });
  assert(res.status === 400, 'Update transaction with negative amount returns 400');

  // 3.9 Update with empty description
  res = await fetch(`${BASE_URL}/transactions/${user1TxId}`, {
    method: 'PUT',
    headers: u1Headers,
    body: JSON.stringify({ description: '   ' }),
  });
  assert(res.status === 400, 'Update transaction with empty description returns 400');

  // ==========================================
  // 4. MULTI-TENANT ISOLATION (CROSS-USER SECURITY)
  // ==========================================
  console.log('\n--- 4. Multi-Tenant Isolation & Security ---');

  // Register User 2
  const user2Email = `user2_${Date.now()}@example.com`;
  res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'User Two', email: user2Email, password: 'password123' }),
  });
  const user2Data = await res.json();
  const user2Token = user2Data.token;
  const u2Headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${user2Token}`,
  };

  // 4.1 User 2 attempts to GET User 1's transaction
  res = await fetch(`${BASE_URL}/transactions/${user1TxId}`, {
    headers: u2Headers,
  });
  assert(res.status === 404, "User 2 cannot access User 1's transaction (returns 404)");

  // 4.2 User 2 attempts to UPDATE User 1's transaction
  res = await fetch(`${BASE_URL}/transactions/${user1TxId}`, {
    method: 'PUT',
    headers: u2Headers,
    body: JSON.stringify({ amount: 999999, description: 'Hacked Transaction' }),
  });
  assert(res.status === 404, "User 2 cannot update User 1's transaction (returns 404)");

  // 4.3 User 2 attempts to DELETE User 1's transaction
  res = await fetch(`${BASE_URL}/transactions/${user1TxId}`, {
    method: 'DELETE',
    headers: u2Headers,
  });
  assert(res.status === 404, "User 2 cannot delete User 1's transaction (returns 404)");

  // 4.4 Verify User 1's transaction was completely unmodified and uncorrupted
  res = await fetch(`${BASE_URL}/transactions/${user1TxId}`, {
    headers: u1Headers,
  });
  const u1Verify = await res.json();
  assert(
    res.status === 200 &&
      u1Verify.data?.amount === 750.5 &&
      u1Verify.data?.description === "User 1's Private Vault Transaction",
    "User 1's transaction remains secure, intact, and unaffected"
  );

  console.log(`\n======================================================`);
  console.log(`🏁 AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

testEdgeCases().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
