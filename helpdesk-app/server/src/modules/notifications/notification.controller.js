import notificationService from './notification.service.js';
import { ApiResponse, ApiError } from '../../utils/apiResponse.js';

/**
 * Get user notifications
 */
export const getNotifications = async (req, res, next) => {
  try {
    // Disable caching for this route
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const userId = req.user.id;
    if (!userId) {
      throw new ApiError(401, 'User not authenticated');
    }
    const { limit = 20, skip = 0 } = req.query;

    const { notifications, total } = await notificationService.getUserNotifications(
      userId,
      parseInt(limit),
      parseInt(skip)
    );

    res.status(200).json(
      new ApiResponse(200, { notifications, total }, 'Notifications retrieved successfully')
    );
  } catch (error) {
    console.error('Error in getNotifications controller:', error);
    next(error);
  }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (req, res, next) => {
  try {
    // Disable caching for this route
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const { notificationId } = req.params;
    const userId = req.user.id; // Get current user's ID for authorization

    const notification = await notificationService.getNotificationById(notificationId); // Fetch to check ownership

    if (!notification) {
      throw new ApiError(404, 'Notification not found');
    }

    // Only the owner of the notification can mark it as read
    if (notification.userId.toString() !== userId) {
        throw new ApiError(403, 'Not authorized to mark this notification as read');
    }

    const updatedNotification = await notificationService.markAsRead(notificationId);

    res.status(200).json(
      new ApiResponse(200, updatedNotification, 'Notification marked as read')
    );
  } catch (error) {
    console.error('Error marking notification as read:', error);
    next(error);
  }
};

/**
 * Get unread count
 */
export const getUnreadCount = async (req, res, next) => {
  try {
    // Disable caching for this route
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const userId = req.user.id;
    if (!userId) {
      throw new ApiError(401, 'User not authenticated');
    }
    const count = await notificationService.getUnreadCount(userId);

    res.status(200).json(
      new ApiResponse(200, { count }, 'Unread count fetched successfully')
    );
  } catch (error) {
    console.error('Error in getUnreadCount controller:', error);
    next(error);
  }
};

/**
 * Mark all as read
 */
export const markAllAsRead = async (req, res, next) => {
    try {
        // Disable caching for this route
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        const userId = req.user.id;
        if (!userId) {
            throw new ApiError(401, 'User not authenticated');
        }

        const result = await notificationService.markAllAsRead(userId);
        res.status(200).json(
            new ApiResponse(200, result, 'All notifications marked as read')
        );
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        next(error);
    }
};

/**
 * Delete notification
 */
export const deleteNotification = async (req, res, next) => {
    try {
        // Disable caching for this route
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        const { notificationId } = req.params;
        const userId = req.user.id;
        
        const notification = await notificationService.getNotificationById(notificationId); // Need to fetch to check owner

        if (!notification) {
            throw new ApiError(404, 'Notification not found');
        }

        // Only the owner of the notification can delete it
        if (notification.userId.toString() !== userId) {
            throw new ApiError(403, 'Not authorized to delete this notification');
        }

        await notificationService.deleteNotification(notificationId);
        res.status(200).json(
            new ApiResponse(200, null, 'Notification deleted successfully')
        );
    } catch (error) {
        console.error('Error deleting notification:', error);
        next(error);
    }
};