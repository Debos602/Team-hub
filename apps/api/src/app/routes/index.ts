import express from 'express';
import { apiLimiter } from '../middlewares/rateLimiter';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { WorkspaceRoutes } from '../modules/workspace/workspace.routes';
import { GoalRoutes } from '../modules/goals/goal.routes';
import { AnnouncementRoutes } from '../modules/announcements/announcement.routes';
import { ActionItemRoutes } from '../modules/action-items/action-item.routes';
import { DashboardRoutes } from '../modules/dashboard/dashboard.routes';



const router = express.Router();



router.use(apiLimiter); // Apply to all routes

const moduleRoutes = [
	{ path: '/auth', route: AuthRoutes },
	{ path: '/workspaces', route: WorkspaceRoutes },
	{ path: '/goals', route: GoalRoutes },
	{ path: '/announcements', route: AnnouncementRoutes },
	{ path: '/action-items', route: ActionItemRoutes },
	{ path: '/dashboard', route: DashboardRoutes },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;