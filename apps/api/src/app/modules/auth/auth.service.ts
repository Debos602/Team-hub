import * as bcrypt from 'bcryptjs';
import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import config from '../../../config';
import { jwtHelpers } from '../../../helpers/jwtHelpers';
import prisma from '../../../shared/prisma';
import ApiError from '../../errors/ApiError';
import cloudinary from '../../../helpers/cloudinary';
import type { Prisma } from '@prisma/client';
import type { UploadApiResponse } from 'cloudinary';

// ─── helpers ────────────────────────────────────────────────────────────────

const parseDurationToMs = (str: string): number => {
    const unit = str.slice(-1);
    const value = parseInt(str.slice(0, -1), 10);
    if (isNaN(value)) return 3_600_000; // default 1h
    switch (unit) {
        case 'y': return value * 365 * 24 * 3_600_000;
        case 'M': return value * 30  * 24 * 3_600_000;
        case 'w': return value * 7   * 24 * 3_600_000;
        case 'd': return value       * 24 * 3_600_000;
        case 'h': return value            * 3_600_000;
        case 'm': return value            *    60_000;
        case 's': return value            *     1_000;
        default : return 3_600_000;
    }
};

// ─── register ───────────────────────────────────────────────────────────────

const register = async (payload: { email: string; password: string; name?: string }) => {
    const existing = await prisma.user.findUnique({ where: { email: payload.email } });
    if (existing) throw new ApiError(httpStatus.CONFLICT, 'Email already registered');

    const hashed = await bcrypt.hash(payload.password, Number(config.salt_round) || 10);

    const createData: any = {
        email: payload.email,
        password: hashed,
        ...(payload.name ? { name: payload.name } : {}),
    } as any;

    const user = await prisma.user.create({
        data: createData,
        select: {
            id: true, createdAt: true, updatedAt: true,
            email: true, name: true, avatar: true,
            emailVerified: true, activeWorkspaceId: true,
        },
    });

    const accessToken  = jwtHelpers.generateToken(
        { id: user.id, email: user.email },
        config.jwt.jwt_secret as Secret,
        config.jwt.expires_in as string,
    );
    const refreshToken = jwtHelpers.generateToken(
        { id: user.id, email: user.email },
        config.jwt.refresh_token_secret as Secret,
        config.jwt.refresh_token_expires_in as string,
    );

    // FIX 1: no silent catch — if this fails we want to know immediately
    const ms = parseDurationToMs(config.jwt.refresh_token_expires_in as string);
    await prisma.refreshToken.create({
        data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + ms) },
    });

    return { accessToken, refreshToken, user };
};

// ─── login ───────────────────────────────────────────────────────────────────

const login = async (payload: { email: string; password: string }) => {
    const user = await prisma.user.findUnique({ where: { email: payload.email } });
    if (!user) throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid credentials');

    const ok = await bcrypt.compare(payload.password, user.password);
    if (!ok) throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid credentials');

    const accessToken  = jwtHelpers.generateToken(
        { id: user.id, email: user.email },
        config.jwt.jwt_secret as Secret,
        config.jwt.expires_in as string,
    );
    const refreshToken = jwtHelpers.generateToken(
        { id: user.id, email: user.email },
        config.jwt.refresh_token_secret as Secret,
        config.jwt.refresh_token_expires_in as string,
    );

    // FIX 1: no silent catch
    const ms = parseDurationToMs(config.jwt.refresh_token_expires_in as string);
    await prisma.refreshToken.create({
        data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + ms) },
    });

    const safeUser = {
        id: user.id, createdAt: user.createdAt, updatedAt: user.updatedAt,
        email: user.email, name: user.name, avatar: user.avatar,
        emailVerified: user.emailVerified, activeWorkspaceId: user.activeWorkspaceId,
    };

    return { accessToken, refreshToken, user: safeUser };
};

// ─── refresh ─────────────────────────────────────────────────────────────────

const refresh = async (token: string) => {
    // FIX 2: decode both id AND email
    type Decoded = { id: string; email: string };
    let decoded: Decoded;

    try {
        decoded = jwtHelpers.verifyToken(
            token,
            config.jwt.refresh_token_secret as Secret,
        ) as Decoded;
    } catch (err: any) {
        if (err?.name === 'TokenExpiredError') {
            throw new ApiError(httpStatus.UNAUTHORIZED, 'Refresh token expired');
        }
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid refresh token');
    }

    console.info('[auth.refresh] token verified for userId=', decoded.id);

    // DB-level lookup by token
    const record = await prisma.refreshToken.findUnique({ where: { token } });
    if (!record) throw new ApiError(httpStatus.UNAUTHORIZED, 'Refresh token not found');

    if (record.expiresAt < new Date()) {
        await prisma.refreshToken.delete({ where: { id: record.id } });
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Refresh token expired');
    }

    // FIX 2: use id (not email) for the DB lookup — faster and unambiguous
    const user = await prisma.user.findUniqueOrThrow({ where: { id: decoded.id } });

    const accessToken = jwtHelpers.generateToken(
        { id: user.id, email: user.email },
        config.jwt.jwt_secret as Secret,
        config.jwt.expires_in as string,
    );
    const newRefresh = jwtHelpers.generateToken(
        { id: user.id, email: user.email },
        config.jwt.refresh_token_secret as Secret,
        config.jwt.refresh_token_expires_in as string,
    );

    // Rotate: update the existing record (one row, no orphan tokens)
    const ms = parseDurationToMs(config.jwt.refresh_token_expires_in as string);
    await prisma.refreshToken.update({
        where: { id: record.id },
        data: { token: newRefresh, expiresAt: new Date(Date.now() + ms) },
    });

    console.info(`[auth.refresh] rotated token for userId=${user.id}`);
    return { accessToken, refreshToken: newRefresh };
};

// ─── logout ──────────────────────────────────────────────────────────────────

const logout = async (token?: string | null) => {
    if (!token) return;
    try {
        const rec = await prisma.refreshToken.findUnique({ where: { token } });
        if (rec) await prisma.refreshToken.delete({ where: { id: rec.id } });
    } catch (err) {
        console.warn('[auth.logout] cleanup failed', err);
    }
};

// ─── getMe ───────────────────────────────────────────────────────────────────

const getMe = async (accessToken: string) => {
    // FIX 2 (same pattern): decode id + email
    type DecodedAccess = { id: string; email: string };
    const decoded = jwtHelpers.verifyToken(
        accessToken,
        config.jwt.jwt_secret as Secret,
    ) as DecodedAccess;

    const user = await prisma.user.findUniqueOrThrow({
        where: { id: decoded.id },
        select: { id: true, email: true, name: true, avatar: true, createdAt: true, updatedAt: true },
    });
    return user;
};

// ─── updateProfile ────────────────────────────────────────────────────────────

const updateProfile = async (
    userId: string,
    payload: { name?: string },
    file?: Express.Multer.File,
) => {
    const data: Record<string, unknown> = {};
    if (payload.name) data.name = payload.name;

    if (file && 'buffer' in file && file.buffer) {
        const upload = await new Promise<UploadApiResponse>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: 'avatars', resource_type: 'image' },
                (err, res) => { if (err) return reject(err); resolve(res as UploadApiResponse); },
            );
            stream.end(file.buffer);
        });
        if (upload?.secure_url) data.avatar = upload.secure_url;
    }

    const updated = await prisma.user.update({
        where: { id: userId },
        data: data as any,
        select: { id: true, email: true, name: true, avatar: true },
    });
    return updated;
};

// ─── exports ─────────────────────────────────────────────────────────────────

const getAllUsers = async () => {
    const users = await prisma.user.findMany({
        select: { id: true, email: true, name: true, avatar: true, createdAt: true, activeWorkspaceId: true },
        orderBy: { createdAt: 'desc' }
    });
    return users;
};

export const AuthServices = { register, login, refresh, logout, getMe, updateProfile, getAllUsers };
export default AuthServices;