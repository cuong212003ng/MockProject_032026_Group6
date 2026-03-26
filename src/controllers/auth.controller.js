const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
<<<<<<< HEAD
<<<<<<< HEAD
const { env } = require('../config/env');
=======
>>>>>>> dabfe06 (feat/init databse and code base (#52))
=======
const { env } = require('../config/env');
>>>>>>> 30a0d89 (feat(notary-profile): implement SC_007 SC_008 and security authorization)
const userModel = require('../models/user.model');
const { sendSuccess, sendError } = require('../utils/response.helper');

const SALT_ROUNDS = 10;
<<<<<<< HEAD
<<<<<<< HEAD
const ACCESS_TOKEN_TTL = env.jwtExpiresIn;
const REFRESH_TOKEN_TTL = env.jwtRefreshExpiresIn;
=======
const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = '7d';
>>>>>>> dabfe06 (feat/init databse and code base (#52))
=======
const ACCESS_TOKEN_TTL = env.jwtExpiresIn;
const REFRESH_TOKEN_TTL = env.jwtRefreshExpiresIn;
>>>>>>> 30a0d89 (feat(notary-profile): implement SC_007 SC_008 and security authorization)
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const generateTokens = (user) => {
  const payload = { id: user.id, username: user.username, role: user.role };
<<<<<<< HEAD
<<<<<<< HEAD
  const accessToken = jwt.sign(payload, env.jwtSecret, { expiresIn: ACCESS_TOKEN_TTL });
  const refreshToken = jwt.sign(payload, env.jwtRefreshSecret, {
=======
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
>>>>>>> dabfe06 (feat/init databse and code base (#52))
=======
  const accessToken = jwt.sign(payload, env.jwtSecret, { expiresIn: ACCESS_TOKEN_TTL });
  const refreshToken = jwt.sign(payload, env.jwtRefreshSecret, {
>>>>>>> 30a0d89 (feat(notary-profile): implement SC_007 SC_008 and security authorization)
    expiresIn: REFRESH_TOKEN_TTL,
  });
  return { accessToken, refreshToken };
};

// ── POST /api/v1/auth/register ────────────────────────────
const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const existing = await userModel.findByUsernameOrEmail(username);
    const existingEmail = await userModel.findByUsernameOrEmail(email);
    if (existing || existingEmail) {
      return sendError(res, 'Username or email already taken', 409);
    }

    // Only ADMIN can create other ADMINs
    const assignedRole = role === 'ADMIN' && req.user?.role === 'ADMIN' ? 'ADMIN' : 'USER';

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = await userModel.create({ username, email, passwordHash, role: assignedRole });

    return sendSuccess(res, newUser, 'User registered successfully', 201);
  } catch (err) {
    console.error('[Auth] register error:', err.message);
    return sendError(res, 'Registration failed', 500);
  }
};

// ── POST /api/v1/auth/login ───────────────────────────────
const login = async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier = username OR email

    const user = await userModel.findByUsernameOrEmail(identifier);
    if (!user) return sendError(res, 'Invalid credentials', 401);
    if (!user.is_active) return sendError(res, 'Account is deactivated', 403);

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return sendError(res, 'Invalid credentials', 401);

    const { accessToken, refreshToken } = generateTokens(user);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
    await userModel.saveRefreshToken(user.id, refreshToken, expiresAt);

    return sendSuccess(
      res,
      {
        accessToken,
        refreshToken,
        user: { id: user.id, username: user.username, email: user.email, role: user.role },
      },
      'Login successful',
    );
  } catch (err) {
    console.error('[Auth] login error:', err.message);
    return sendError(res, 'Login failed', 500);
  }
};

// ── POST /api/v1/auth/refresh ─────────────────────────────
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return sendError(res, 'Refresh token required', 400);

    // Verify signature
    let decoded;
    try {
<<<<<<< HEAD
<<<<<<< HEAD
      decoded = jwt.verify(refreshToken, env.jwtRefreshSecret);
=======
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
>>>>>>> dabfe06 (feat/init databse and code base (#52))
=======
      decoded = jwt.verify(refreshToken, env.jwtRefreshSecret);
>>>>>>> 30a0d89 (feat(notary-profile): implement SC_007 SC_008 and security authorization)
    } catch {
      return sendError(res, 'Invalid or expired refresh token', 401);
    }

    // Check it exists in DB
    const stored = await userModel.findRefreshToken(refreshToken);
    if (!stored) return sendError(res, 'Refresh token revoked or expired', 401);

    // Rotate: delete old, issue new pair
    await userModel.deleteRefreshToken(refreshToken);
    const user = { id: decoded.id, username: decoded.username, role: decoded.role };
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
    await userModel.saveRefreshToken(user.id, newRefreshToken, expiresAt);

    return sendSuccess(res, { accessToken, refreshToken: newRefreshToken }, 'Tokens refreshed');
  } catch (err) {
    console.error('[Auth] refresh error:', err.message);
    return sendError(res, 'Token refresh failed', 500);
  }
};

// ── POST /api/v1/auth/logout ──────────────────────────────
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) await userModel.deleteRefreshToken(refreshToken);
    return sendSuccess(res, null, 'Logged out successfully');
  } catch (err) {
    console.error('[Auth] logout error:', err.message);
    return sendError(res, 'Logout failed', 500);
  }
};

// ── POST /api/v1/auth/logout-all ─────────────────────────
const logoutAll = async (req, res) => {
  try {
    await userModel.deleteAllRefreshTokens(req.user.id);
    return sendSuccess(res, null, 'Logged out from all devices');
  } catch (err) {
    console.error('[Auth] logoutAll error:', err.message);
    return sendError(res, 'Logout failed', 500);
  }
};

// ── GET /api/v1/auth/me ───────────────────────────────────
const me = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) return sendError(res, 'User not found', 404);
    return sendSuccess(res, user);
  } catch (err) {
    console.error('[Auth] me error:', err.message);
    return sendError(res, 'Failed to fetch user', 500);
  }
};

module.exports = { register, login, refresh, logout, logoutAll, me };
