import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { AuthServices } from './auth.service';

import ApiError from '../../errors/ApiError';
import config from '../../../config';
import authValidation from './auth.validation';

const cookieOptions = (ms: number) => ({
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,
  sameSite: process.env.NODE_ENV === 'production' ? ('none' as const) : ('lax' as const),
  maxAge: ms,
});

const parseDurationToMs = (str: string) => {
  const unit = str.slice(-1);
  const value = parseInt(str.slice(0, -1));
  if (isNaN(value)) return 0;
  switch (unit) {
    case 'y': return value * 365 * 24 * 60 * 60 * 1000;
    case 'M': return value * 30 * 24 * 60 * 60 * 1000;
    case 'w': return value * 7 * 24 * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'm': return value * 60 * 1000;
    case 's': return value * 1000;
    default: return 1000 * 60 * 60;
  }
};

const register = catchAsync(async (req: Request, res: Response) => {
  const payload = authValidation.registerSchema.parse(req.body);
  const result = await AuthServices.register(payload);

  const accessMs = parseDurationToMs((config.jwt.expires_in as string) || '1h');
  const refreshMs = parseDurationToMs((config.jwt.refresh_token_expires_in as string) || '30d');

  res.cookie('accessToken', result.accessToken, cookieOptions(accessMs));
  res.cookie('refreshToken', result.refreshToken, cookieOptions(refreshMs));

  return sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: 'User registered', data: result.user });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const payload = authValidation.loginSchema.parse(req.body);
  const result = await AuthServices.login(payload);

  const accessMs = parseDurationToMs((config.jwt.expires_in as string) || '1h');
  const refreshMs = parseDurationToMs((config.jwt.refresh_token_expires_in as string) || '30d');

  res.cookie('accessToken', result.accessToken, cookieOptions(accessMs));
  res.cookie('refreshToken', result.refreshToken, cookieOptions(refreshMs));

  return sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Logged in', data: { user: result.user, accessToken: result.accessToken, refreshToken: result.refreshToken } });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  console.info('[auth.refreshToken] cookies:', req.cookies, 'body:', req.body);
  const token = (req.cookies.refreshToken as string | undefined) || (req.body.refreshToken as string | undefined);
  if (!token) {
    console.warn('[auth.refreshToken] no refresh token found in cookies or body');
    throw new ApiError(httpStatus.UNAUTHORIZED, 'No refresh token');
  }
  const result = await AuthServices.refresh(token);

  const accessMs = parseDurationToMs((config.jwt.expires_in as string) || '1h');
  const refreshMs = parseDurationToMs((config.jwt.refresh_token_expires_in as string) || '30d');

  res.cookie('accessToken', result.accessToken, cookieOptions(accessMs));
  res.cookie('refreshToken', result.refreshToken, cookieOptions(refreshMs));

  // also include the user so the client can populate state from a silent refresh
  const user = await AuthServices.getMe(result.accessToken);
  return sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Token refreshed', data: { accessToken: result.accessToken, refreshToken: result.refreshToken, user } });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken as string | undefined;
  await AuthServices.logout(token);

  const clearOpts = {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? ('none' as const) : ('lax' as const),
  };

  res.clearCookie('accessToken', clearOpts);
  res.clearCookie('refreshToken', clearOpts);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Logged out',
    data: null,
  });
});

type AuthUser = { id: string; email?: string };

const me = catchAsync(async (req: Request & { user?: AuthUser }, res: Response) => {
  const access = req.cookies.accessToken as string | undefined;
  if (!access) throw new ApiError(httpStatus.UNAUTHORIZED, 'Not authenticated');
  const user = await AuthServices.getMe(access);
  return sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'User retrieved', data: user });
});

const updateProfile = catchAsync(async (req: Request & { user?: AuthUser; file?: Express.Multer.File }, res: Response) => {
  const user = req.user as AuthUser | undefined;
  if (!user) throw new ApiError(httpStatus.UNAUTHORIZED, 'Not authenticated');
  const payload = authValidation.updateProfileSchema.parse(req.body);
  const updated = await AuthServices.updateProfile(user.id, payload, req.file);
  return sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Profile updated', data: updated });
});

const getAllUsers = catchAsync(async (req: Request & { user?: AuthUser }, res: Response) => {
  // only ADMINs should be allowed at the route level via middleware
  const users = await AuthServices.getAllUsers();
  return sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Users retrieved', data: users });
});

export const AuthController = { register, login, refreshToken, logout, me, updateProfile, getAllUsers };
