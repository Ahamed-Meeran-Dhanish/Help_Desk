import Notification from './notification.model.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

class NotificationService {
  /**
   * Create in-app notification
   */
  async createNotification(userId, type, title, message, ticketId = null) {
    try {
      const notification = new Notification({
        userId,
        type,
        title,
        message,
        ticketId,
        metadata: new Map()
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Send email notification
   */
  async sendEmailNotification(userEmail, subject, htmlContent, notificationId = null) {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@helpdesk.com',
        to: userEmail,
        subject,
        html: htmlContent
      };

      await transporter.sendMail(mailOptions);

      // Update notification as email sent
      if (notificationId) {
        await Notification.findByIdAndUpdate(notificationId, { emailSent: true });
      }

      return { success: true };
    } catch (error) {
      console.error('Error sending email:', error);

      // Log email error
      if (notificationId) {
        await Notification.findByIdAndUpdate(notificationId, {
          emailError: error.message
        });
      }

      return { success: false, error: error.message };
    }
  }

  /**
   * Notify ticket assignment
   */
  async notifyTicketAssignment(ticket, agentEmail, agentName) {
    const title = 'Ticket Assigned';
    const message = `You have been assigned to ticket #${ticket._id}`;

    // Create in-app notification
    await this.createNotification(
      ticket.assignedTo,
      'TICKET_ASSIGNED',
      title,
      message,
      ticket._id
    );

    // Send email
    const htmlContent = `
      <h2>Ticket Assignment Notification</h2>
      <p>Hello ${agentName},</p>
      <p>You have been assigned to a new ticket:</p>
      <ul>
        <li><strong>Ticket ID:</strong> ${ticket._id}</li>
        <li><strong>Subject:</strong> ${ticket.subject}</li>
        <li><strong>Priority:</strong> ${ticket.priority}</li>
        <li><strong>Description:</strong> ${ticket.description}</li>
      </ul>
      <p><a href="${process.env.CLIENT_URL}/tickets/${ticket._id}">View Ticket</a></p>
    `;

    await this.sendEmailNotification(agentEmail, title, htmlContent);
  }

  /**
   * Notify ticket creation
   */
  async notifyTicketCreation(ticket, creatorName, creatorEmail) {
    const title = 'Ticket Created Successfully';
    const message = `Your ticket #${ticket._id} has been created`;

    // Create in-app notification
    await this.createNotification(
      ticket.createdBy,
      'TICKET_CREATED',
      title,
      message,
      ticket._id
    );

    // Send email to creator
    const htmlContent = `
      <h2>Ticket Created</h2>
      <p>Hello ${creatorName},</p>
      <p>Your ticket has been created successfully:</p>
      <ul>
        <li><strong>Ticket ID:</strong> ${ticket._id}</li>
        <li><strong>Subject:</strong> ${ticket.subject}</li>
        <li><strong>Status:</strong> ${ticket.status}</li>
      </ul>
      <p><a href="${process.env.CLIENT_URL}/tickets/${ticket._id}">View Ticket</a></p>
    `;

    await this.sendEmailNotification(creatorEmail, title, htmlContent);
  }

  /**
   * Notify note added
   */
  async notifyNoteAdded(ticket, note, authorName, userEmail) {
    const title = 'New Note on Your Ticket';
    const message = `A new note has been added to ticket #${ticket._id}`;

    // Create in-app notification
    await this.createNotification(
      ticket.createdBy,
      'NOTE_ADDED',
      title,
      message,
      ticket._id
    );

    // Send email
    const htmlContent = `
      <h2>New Note Added</h2>
      <p>Hello,</p>
      <p>${authorName} has added a note to your ticket:</p>
      <blockquote style="border-left: 3px solid #ccc; padding-left: 10px;">
        ${note.content}
      </blockquote>
      <p><a href="${process.env.CLIENT_URL}/tickets/${ticket._id}">View Ticket</a></p>
    `;

    await this.sendEmailNotification(userEmail, title, htmlContent);
  }

  /**
   * Notify SLA breach
   */
  async notifySLABreach(ticket, slaData) {
    const title = 'SLA Breach Alert';
    const message = `Ticket #${ticket._id} has breached SLA`;

    // Create in-app notification for assigned agent
    await this.createNotification(
      ticket.assignedTo,
      'SLA_BREACH',
      title,
      message,
      ticket._id
    );

    return { notificationCreated: true };
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId, limit = 20, skip = 0) {
    try {
      const query = { userId };

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate('ticketId', 'subject')
        .populate('relatedUserId', 'name email');

      const total = await Notification.countDocuments(query);

      return { notifications, total };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId) {
    try {
      return await Notification.findByIdAndUpdate(
        notificationId,
        { isRead: true },
        { new: true }
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId) {
    try {
      return await Notification.countDocuments({ userId, isRead: false });
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId) {
    try {
      const result = await Notification.updateMany(
        { userId: userId, isRead: false }, // Only mark unread ones
        { $set: { isRead: true } }
      );
      return { modifiedCount: result.modifiedCount };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId) {
    try {
      const notification = await Notification.findByIdAndDelete(notificationId);
      if (!notification) {
        throw new Error('Notification not found for deletion');
      }
      return notification;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Get notification by ID
   */
  async getNotificationById(notificationId) {
    try {
        return await Notification.findById(notificationId);
    } catch (error) {
        console.error('Error getting notification by ID:', error);
        throw error;
    }
  }
}

export default new NotificationService();