import Note from './note.model.js';
import Ticket from './ticket.model.js';
import User from '../users/user.model.js';
import { ApiError } from '../../utils/apiResponse.js';
import notificationService from '../notifications/notification.service.js';
import TicketLog from './ticketLog.model.js';

// @desc    Get notes for a ticket
// @route   GET /api/tickets/:ticketId/notes
// @access  Private
export const getNotes = async (req, res, next) => {
    try {
        const ticket = await Ticket.findById(req.params.ticketId);

        if (!ticket) {
            throw new ApiError(404, 'Ticket not found');
        }

        // Access check (User can see own, Staff can see all allowed)
        if (req.user.role === 'user' && ticket.createdBy.toString() !== req.user.id) {
            throw new ApiError(401, 'User not authorized');
        }

        let query = { ticket: req.params.ticketId };

        // If regular user, hide internal notes
        if (req.user.role === 'user') {
            query.isInternal = false;
        }

        const notes = await Note.find(query).populate('user', 'name role');

        res.status(200).json({
            success: true,
            data: notes,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create ticket note
// @route   POST /api/tickets/:ticketId/notes
// @access  Private
export const addNote = async (req, res, next) => {
    try {
        const ticket = await Ticket.findById(req.params.ticketId);

        if (!ticket) {
            throw new ApiError(404, 'Ticket not found');
        }

        if (req.user.role === 'user' && ticket.createdBy.toString() !== req.user.id) {
            throw new ApiError(401, 'User not authorized');
        }

        const note = await Note.create({
            text: req.body.text,
            isStaff: req.user.role !== 'user', // Flag for checking if it's a staff note
            isInternal: req.body.isInternal && req.user.role !== 'user', // Only staff can make internal notes
            ticket: req.params.ticketId,
            user: req.user.id
        });

        // Log the note addition
        await TicketLog.create({
            ticket: req.params.ticketId,
            action: note.isInternal ? 'Internal Note Added' : 'Note Added',
            performedBy: req.user.id,
            newValue: { text: note.text, isInternal: note.isInternal }
        });

        // Trigger notification for external notes only
        if (!note.isInternal) {
            try {
                const author = await User.findById(req.user.id);
                const ticketCreator = await User.findById(ticket.createdBy);

                // Get populated ticket for notification
                const populatedTicket = await Ticket.findById(ticket._id)
                    .populate('createdBy', 'name email')
                    .populate('assignedTo', 'name email');

                // Notify ticket creator about new note
                await notificationService.notifyNoteAdded(
                    populatedTicket,
                    note,
                    author.name,
                    ticketCreator.email
                );

                // If note is from customer, also notify assigned agent
                if (req.user.role === 'user' && ticket.assignedTo) {
                    const agent = await User.findById(ticket.assignedTo);
                    if (agent) {
                        await notificationService.createNotification(
                            ticket.assignedTo,
                            'NOTE_ADDED',
                            'New Note on Assigned Ticket',
                            `${author.name} added a note to ticket #${ticket._id}`,
                            ticket._id
                        );
                    }
                }

            } catch (notifError) {
                console.error('Error sending note notification:', notifError);
                // Don't throw - notification failure shouldn't stop note creation
            }
        }

        // Populate user details for immediate frontend display
        await note.populate('user', 'name role');

        res.status(200).json({
            success: true,
            data: note,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete ticket note
// @route   DELETE /api/tickets/:ticketId/notes/:noteId
// @access  Private
export const deleteNote = async (req, res, next) => {
    try {
        const { ticketId, noteId } = req.params;

        const note = await Note.findById(noteId);

        if (!note) {
            throw new ApiError(404, 'Note not found');
        }

        // Check if note belongs to the ticket
        if (note.ticket.toString() !== ticketId) {
            throw new ApiError(400, 'Note does not belong to this ticket');
        }

        // Only creator or admin can delete
        if (note.user.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'super-admin') {
            throw new ApiError(403, 'Not authorized to delete this note');
        }

        // Log the note deletion
        await TicketLog.create({
            ticket: ticketId,
            action: 'Note Deleted',
            performedBy: req.user.id,
            newValue: { text: note.text, noteId: noteId }
        });

        await Note.findByIdAndDelete(noteId);

        res.status(200).json({
            success: true,
            message: 'Note deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
