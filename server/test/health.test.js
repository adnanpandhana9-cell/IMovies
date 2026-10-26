import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../app.js';
import { getDatabaseStatus } from '../config/db.js';

test('Database status helper returns expected schema without credentials', () => {
  const status = getDatabaseStatus();
  assert.equal(typeof status.connected, 'boolean');
  assert.equal(typeof status.state, 'string');
  assert.equal(status.password, undefined);
  assert.equal(status.uri, undefined);
});

test('Express application instantiates and has health route registered', () => {
  assert.ok(app);
  assert.equal(typeof app.listen, 'function');
});
