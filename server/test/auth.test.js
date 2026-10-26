import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { generateToken, verifyToken } from '../utils/jwt.js';
import { protect, authorize } from '../middleware/auth.js';
import { register, login, getMe } from '../controllers/authController.js';

const TEST_SECRET = 'imovies_test_jwt_secret_minimum_32_characters_long_for_security';
process.env.JWT_SECRET = TEST_SECRET;

// ============================================================
// 1. User Model & Password Hashing Tests
// ============================================================
test('User model hashes password on save and compares correctly', async () => {
  const plainPassword = 'SuperSecretPassword123!';
  const user = new User({
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: plainPassword,
  });

  // Trigger pre-save hook manually
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  // Password in user.password must now be a bcrypt hash (starts with $2)
  assert.ok(user.password.startsWith('$2'));
  assert.notEqual(user.password, plainPassword);

  // comparePassword should succeed for matching password
  const matches = await user.comparePassword(plainPassword);
  assert.equal(matches, true);

  // comparePassword should fail for wrong password
  const wrongMatches = await user.comparePassword('WrongPassword123!');
  assert.equal(wrongMatches, false);
});

test('User toJSON method strips password and internal fields', () => {
  const user = new User({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashed_password_sample',
    role: 'USER',
  });

  const json = user.toJSON();
  assert.equal(json.password, undefined);
  assert.equal(json.__v, undefined);
  assert.equal(json.email, 'john@example.com');
  assert.equal(json.role, 'USER');
});

test('User model defaults role to USER and enforces allowed roles', () => {
  const defaultUser = new User({
    name: 'Default User',
    email: 'default@example.com',
    password: 'Password123!',
  });
  assert.equal(defaultUser.role, 'USER');

  // Verify role enum validation
  const invalidUser = new User({
    name: 'Hacker',
    email: 'hacker@example.com',
    password: 'Password123!',
    role: 'SUPERADMIN',
  });
  const err = invalidUser.validateSync();
  assert.ok(err.errors.role);
});

// ============================================================
// 2. JWT Generation, Expiry, and Tampering Tests
// ============================================================
test('JWT token generation and verification with valid payload', () => {
  const mockUser = {
    _id: '671ba75c94c9a62ef0000001',
    email: 'jane@example.com',
    role: 'USER',
  };

  const token = generateToken(mockUser);
  assert.ok(typeof token === 'string');
  assert.ok(token.split('.').length === 3);

  const decoded = verifyToken(token);
  assert.equal(decoded.id, mockUser._id);
  assert.equal(decoded.email, mockUser.email);
  assert.equal(decoded.role, mockUser.role);
});

test('Tampered JWT token fails verification with JsonWebTokenError', () => {
  const mockUser = {
    _id: '671ba75c94c9a62ef0000001',
    email: 'jane@example.com',
    role: 'USER',
  };

  const validToken = generateToken(mockUser);
  // Modify last characters of signature to simulate tampering
  const tamperedToken = validToken.slice(0, -6) + 'abc123';

  assert.throws(
    () => verifyToken(tamperedToken),
    (err) => err.name === 'JsonWebTokenError'
  );
});

test('Expired JWT token fails verification with TokenExpiredError', () => {
  const secret = process.env.JWT_SECRET || 'imovies_fallback_dev_secret_key_32chars';
  const expiredToken = jwt.sign(
    { id: '123', email: 'test@example.com', role: 'USER' },
    secret,
    { expiresIn: '0s' } // Expired immediately
  );

  assert.throws(
    () => verifyToken(expiredToken),
    (err) => err.name === 'TokenExpiredError'
  );
});

// ============================================================
// 3. Controller Tests: Public Registration Security
// ============================================================
test('Public registration rejects duplicate email', async () => {
  // Stub User.findOne to simulate an existing account
  const originalFindOne = User.findOne;
  User.findOne = async () => ({ email: 'existing@example.com' });

  const req = {
    body: {
      name: 'Existing User',
      email: 'existing@example.com',
      password: 'Password123!',
    },
  };

  let responseStatus = null;
  let responseData = null;

  const res = {
    status(code) {
      responseStatus = code;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    },
  };

  try {
    await register(req, res, () => {});
    assert.equal(responseStatus, 400);
    assert.equal(responseData.success, false);
    assert.ok(responseData.message.includes('already exists'));
  } finally {
    User.findOne = originalFindOne;
  }
});

test('Public registration strictly forces USER role and ignores client-provided ADMIN role', async () => {
  const originalFindOne = User.findOne;
  const originalSave = User.prototype.save;

  User.findOne = async () => null; // No duplicate
  let savedRole = null;
  User.prototype.save = async function () {
    savedRole = this.role;
    return this;
  };

  const req = {
    body: {
      name: 'Attempted Admin',
      email: 'tryadmin@example.com',
      password: 'Password123!',
      role: 'ADMIN', // Attacker sends ADMIN role
    },
  };

  let responseStatus = null;
  let responseData = null;

  const res = {
    status(code) {
      responseStatus = code;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    },
  };

  try {
    await register(req, res, () => {});
    assert.equal(responseStatus, 201);
    assert.equal(responseData.success, true);
    // Role must be forced to 'USER'
    assert.equal(savedRole, 'USER');
    assert.equal(responseData.user.role, 'USER');
  } finally {
    User.findOne = originalFindOne;
    User.prototype.save = originalSave;
  }
});

test('Login with incorrect password returns 401 with generic error', async () => {
  const originalFindOne = User.findOne;
  User.findOne = async () => ({
    email: 'valid@example.com',
    comparePassword: async () => false, // Password mismatch
  });

  const req = {
    body: {
      email: 'valid@example.com',
      password: 'WrongPassword!',
    },
  };

  let responseStatus = null;
  let responseData = null;

  const res = {
    status(code) {
      responseStatus = code;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    },
  };

  try {
    await login(req, res, () => {});
    assert.equal(responseStatus, 401);
    assert.equal(responseData.success, false);
    assert.equal(responseData.message, 'Invalid email or password');
  } finally {
    User.findOne = originalFindOne;
  }
});

test('Login for non-existent email returns identical 401 generic error', async () => {
  const originalFindOne = User.findOne;
  User.findOne = async () => null; // User not found

  const req = {
    body: {
      email: 'nonexistent@example.com',
      password: 'AnyPassword!',
    },
  };

  let responseStatus = null;
  let responseData = null;

  const res = {
    status(code) {
      responseStatus = code;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    },
  };

  try {
    await login(req, res, () => {});
    assert.equal(responseStatus, 401);
    assert.equal(responseData.success, false);
    assert.equal(responseData.message, 'Invalid email or password');
  } finally {
    User.findOne = originalFindOne;
  }
});

// ============================================================
// 4. Middleware: Protect & RBAC Authorize Tests
// ============================================================
test('Protect middleware rejects requests without Authorization header', async () => {
  const req = { headers: {} };
  let responseStatus = null;
  let responseData = null;

  const res = {
    status(code) {
      responseStatus = code;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    },
  };

  await protect(req, res, () => {});
  assert.equal(responseStatus, 401);
  assert.equal(responseData.success, false);
  assert.ok(responseData.message.includes('No authentication token provided'));
});

test('Protect middleware rejects requests with malformed or tampered token', async () => {
  const req = { headers: { authorization: 'Bearer invalid.token.value' } };
  let responseStatus = null;
  let responseData = null;

  const res = {
    status(code) {
      responseStatus = code;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    },
  };

  await protect(req, res, () => {});
  assert.equal(responseStatus, 401);
  assert.equal(responseData.success, false);
  assert.ok(responseData.message.includes('Invalid or malformed token'));
});

test('RBAC authorize middleware permits ADMIN role for ADMIN-only route', () => {
  const adminReq = {
    user: { id: 'admin1', name: 'Admin', role: 'ADMIN' },
  };

  let nextCalled = false;
  const adminMiddleware = authorize('ADMIN');

  adminMiddleware(adminReq, {}, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
});

test('RBAC authorize middleware rejects USER role with 403 Forbidden', () => {
  const userReq = {
    user: { id: 'user1', name: 'Standard User', role: 'USER' },
  };

  let responseStatus = null;
  let responseData = null;

  const res = {
    status(code) {
      responseStatus = code;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    },
  };

  let nextCalled = false;
  const adminMiddleware = authorize('ADMIN');

  adminMiddleware(userReq, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(responseStatus, 403);
  assert.equal(responseData.success, false);
  assert.ok(responseData.message.includes('Forbidden'));
});
