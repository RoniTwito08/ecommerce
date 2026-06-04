'use strict';

const authService = require('../services/auth.service');
const { success, created } = require('../utils/ApiResponse');
const { REFRESH_TOKEN_COOKIE } = require('../constants');

const register = async (req, res, next) => {
  try {
    const { accessToken, refreshToken, user } = await authService.register(req.body);
    res.cookie(REFRESH_TOKEN_COOKIE.NAME, refreshToken, REFRESH_TOKEN_COOKIE.OPTIONS);
    return created(res, { accessToken, user });
  } catch (err) {
    return next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { accessToken, refreshToken, user } = await authService.login(req.body);
    res.cookie(REFRESH_TOKEN_COOKIE.NAME, refreshToken, REFRESH_TOKEN_COOKIE.OPTIONS);
    return success(res, { accessToken, user });
  } catch (err) {
    return next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const token = req.cookies[REFRESH_TOKEN_COOKIE.NAME];
    const { accessToken, refreshToken, user } = await authService.refresh(token);
    res.cookie(REFRESH_TOKEN_COOKIE.NAME, refreshToken, REFRESH_TOKEN_COOKIE.OPTIONS);
    return success(res, { accessToken, user });
  } catch (err) {
    return next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const token = req.cookies[REFRESH_TOKEN_COOKIE.NAME];
    await authService.logout(token);
    res.clearCookie(REFRESH_TOKEN_COOKIE.NAME, REFRESH_TOKEN_COOKIE.OPTIONS);
    return success(res, { message: 'Logged out successfully.' });
  } catch (err) {
    return next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    return success(res, { user });
  } catch (err) {
    return next(err);
  }
};

module.exports = { register, login, refresh, logout, getMe };
