import express from 'express';
import * as notificationController from './notification.controller.js';
import { protect } from '../../middlewares/auth.middleware.js'; // Ensure 'protect' is correctly imported

const router = express.Router();

router.use(protect);

router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.put('/:notificationId/read', notificationController.markAsRead);
router.put('/mark-all-read', notificationController.markAllAsRead); // NEW ROUTE
router.delete('/:notificationId', notificationController.deleteNotification); // NEW ROUTE

export default router;