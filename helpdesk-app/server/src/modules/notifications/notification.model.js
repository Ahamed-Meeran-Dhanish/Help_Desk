import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['TICKET_CREATED', 'TICKET_ASSIGNED', 'TICKET_UPDATED', 'NOTE_ADDED', 'SLA_BREACH'],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket'
    },
    relatedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isRead: {
      type: Boolean,
      default: false
    },
    emailSent: {
      type: Boolean,
      default: false
    },
    emailError: {
      type: String,
      default: null
    },
    metadata: {
      type: Map,
      of: String,
      default: new Map()
    }
  },
  { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);