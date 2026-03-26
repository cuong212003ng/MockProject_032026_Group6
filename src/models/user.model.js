const { query } = require('../config/db');

// ── Find user by username or email ────────────────────────
const findByUsernameOrEmail = async (identifier) => {
  const result = await query(
    'SELECT id, username, email, password_hash, role, is_active FROM users WHERE username = @id OR email = @id',
    { id: identifier },
  );
  return result.recordset[0] || null;
};

const findById = async (id) => {
  const result = await query(
    'SELECT id, username, email, role, is_active, created_at FROM users WHERE id = @id',
    { id },
  );
  return result.recordset[0] || null;
};

// ── Create user ───────────────────────────────────────────
const create = async ({ username, email, passwordHash, role = 'USER' }) => {
  const result = await query(
    `INSERT INTO users (username, email, password_hash, role)
     OUTPUT INSERTED.id, INSERTED.username, INSERTED.email, INSERTED.role
     VALUES (@username, @email, @passwordHash, @role)`,
    { username, email, passwordHash, role },
  );
  return result.recordset[0];
};

// ── Save refresh token ────────────────────────────────────
const saveRefreshToken = async (userId, token, expiresAt) => {
  await query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (@userId, @token, @expiresAt)',
    { userId, token, expiresAt },
  );
};

// ── Find valid refresh token ──────────────────────────────
const findRefreshToken = async (token) => {
  const result = await query(
    'SELECT rt.*, u.role FROM refresh_tokens rt JOIN users u ON u.id = rt.user_id WHERE rt.token = @token AND rt.expires_at > GETDATE()',
    { token },
  );
  return result.recordset[0] || null;
};

// ── Delete refresh token (logout) ─────────────────────────
const deleteRefreshToken = async (token) => {
  await query('DELETE FROM refresh_tokens WHERE token = @token', { token });
};

// ── Delete all refresh tokens for user (logout all) ───────
const deleteAllRefreshTokens = async (userId) => {
  await query('DELETE FROM refresh_tokens WHERE user_id = @userId', { userId });
};

module.exports = {
  findByUsernameOrEmail,
  findById,
  create,
  saveRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
  deleteAllRefreshTokens,
};
