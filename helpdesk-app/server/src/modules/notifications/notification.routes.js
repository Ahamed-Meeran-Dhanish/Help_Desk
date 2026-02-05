import express from 'express';
import * as notificationController from './notification.controller.js';
import { protect } from '../../middlewares/auth.middleware.js'; 

const router = express.Router();

router.use(protect);

router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.put('/:notificationId/read', notificationController.markAsRead);
router.put('/mark-all-read', notificationController.markAllAsRead); 
router.delete('/:notificationId', notificationController.deleteNotification); 

export default router;
