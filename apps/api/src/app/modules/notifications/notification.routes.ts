import express from 'express';
import auth from '../../middlewares/auth';
import { NotificationController } from './notification.controller';

const router = express.Router();

// GET /api/v1/notifications - list current user's notifications
router.get('/', auth(), NotificationController.getMyNotifications);

// POST /api/v1/notifications/:id/read - mark a notification as read
router.post('/:id/read', auth(), NotificationController.markRead);

export const NotificationRoutes = router;
