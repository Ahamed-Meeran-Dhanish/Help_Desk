import Note from './note.model.js';
import Ticket from './ticket.model.js';
import User from '../users/user.model.js';
import notificationService from '../notifications/notification.service.js';
import { ApiError } from '../../utils/apiResponse.js';

export const createNote = async (ticketId, noteData, userId) => {
    try {
        // Verify ticket exists
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            throw new ApiError(404, 'Ticket not found');
        }

        // Create note
        const note = await Note.create({
            ticketId,
            content: noteData.content,
            createdBy: userId,
            isInternal: noteData.isInternal || false
        });

        // Trigger notification if external note
        if (!noteData.isInternal) {
            try {
                const author = await User.findById(userId);
                const ticketCreator = await User.findById(ticket.createdBy);

                await notificationService.notifyNoteAdded(
                    ticket,
                    note,
                    author.name,
                    ticketCreator.email
                );
            } catch (notifError) {
                console.error('Error sending note notification:', notifError);
            }
        }

        return note;
    } catch (error) {
        throw error;
    }
};

export const getNotesByTicketId = async (ticketId) => {
    try {
        return await Note.find({ ticketId })
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });
    } catch (error) {
        throw error;
    }
};

export const deleteNote = async (noteId, userId) => {
    try {
        const note = await Note.findById(noteId);
        if (!note) {
            throw new ApiError(404, 'Note not found');
        }

        // Only creator or admin can delete
        if (note.createdBy.toString() !== userId.toString()) {
            throw new ApiError(403, 'Not authorized to delete this note');
        }

        return await Note.findByIdAndDelete(noteId);
    } catch (error) {
        throw error;
    }
};
