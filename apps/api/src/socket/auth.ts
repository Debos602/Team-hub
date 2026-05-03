import { Socket } from 'socket.io';
import { authUtils } from '../app/helpers/jwt';

export const authenticateSocket = (socket: Socket, next: (err?: Error) => void) => {
  try {
    const token =
      (socket.handshake.auth?.token as string) ||
      (socket.handshake.headers?.authorization as string)?.replace('Bearer ', '');

    if (!token) return next(new Error('Authentication error: No token provided'));

    const payload = authUtils.verifyToken(token) as any;
    if (!payload?.id) return next(new Error('Authentication error: Invalid token'));

    (socket as any).user = { id: payload.id, email: payload.email };
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
};
