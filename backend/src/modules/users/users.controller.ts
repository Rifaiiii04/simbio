import { type Request, type Response, type NextFunction } from 'express';
import { updateProfileSchema } from './users.validation.js';
import * as usersService from './users.service.js';
import * as usersRepo from './users.repository.js';
import { sendSuccess } from '../../shared/response/success.js';
import { AppError } from '../../shared/errors/AppError.js';
import { ErrorCode } from '../../shared/errors/codes.js';

export async function getMeHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new AppError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401);
    const user = await usersService.getOwnProfile(req.user.id);
    sendSuccess(res, { user });
  } catch (err) {
    next(err);
  }
}

export async function updateMeHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new AppError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401);
    const data = updateProfileSchema.parse(req.body);
    const user = await usersService.updateProfile(req.user.id, data);
    sendSuccess(res, { user });
  } catch (err) {
    next(err);
  }
}

export async function updateLocationHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new AppError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401);
    const { latitude, longitude, locationEnabled } = req.body as {
      latitude?: number | null;
      longitude?: number | null;
      locationEnabled: boolean;
    };
    if (typeof locationEnabled !== 'boolean') {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'locationEnabled must be boolean', 400);
    }
    // When enabling, coordinates are required
    if (locationEnabled && (latitude == null || longitude == null)) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'latitude and longitude are required when enabling location', 400);
    }
    const result = await usersRepo.updateLocation(req.user.id, {
      latitude: locationEnabled ? (latitude ?? null) : null,
      longitude: locationEnabled ? (longitude ?? null) : null,
      locationEnabled,
    });
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function uploadAvatarHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new AppError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401);
    if (!req.file) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'No image file uploaded', 400);
    }
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const user = await usersRepo.updateProfile(req.user.id, { avatarUrl });
    sendSuccess(res, { user, avatarUrl });
  } catch (err) {
    next(err);
  }
}

export async function getUserHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const user = await usersService.getPublicProfile(id);
    sendSuccess(res, { user });
  } catch (err) {
    next(err);
  }
}

export async function getAdminAnalyticsHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const analytics = await usersRepo.getAdminAnalytics();
    sendSuccess(res, { analytics });
  } catch (err) {
    next(err);
  }
}

export async function getAdminAiAnalyticsHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const aiAnalytics = await usersRepo.getAdminAiAnalytics();
    sendSuccess(res, { aiAnalytics });
  } catch (err) {
    next(err);
  }
}

export async function getAdminUsersHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const users = await usersRepo.getAdminUsersList();
    sendSuccess(res, { users });
  } catch (err) {
    next(err);
  }
}
