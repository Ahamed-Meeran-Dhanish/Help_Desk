import Ticket from './ticket.model.js';
import TicketLog from './ticketLog.model.js';
import { ApiError } from '../../utils/apiResponse.js';

export const createTicket = async (ticketData, userId) => {
    const ticket = await Ticket.create({
        ...ticketData,
        createdBy: userId,
    });

    // Log the creation
    await TicketLog.create({
        ticket: ticket._id,
        action: 'Ticket Created',
        performedBy: userId,
        newValue: ticket.toObject() // Log initial state
    });

    return ticket;
};

export const getAllTickets = async (query, user) => {
    let filter = {};

    // RBAC: Filter tickets based on user role
    // Users can only see their own tickets
    if (user.role === 'user') {
        filter.createdBy = user._id;
    }
    else if (user.role === 'agent') {
        // Agents can see tickets assigned to them OR unassigned tickets in their department
        filter.$or = [
            { assignedTo: user._id },
            { department: user.department, assignedTo: null }
        ];
    }
    else if (user.role === 'manager') {
        // Managers see everything in their department
        filter.department = user.department;
    }
    // Admins and Super-Admins see everything (empty filter base)

    // Apply additional filters from query parameter (status, priority, etc.)
    if (query.status) filter.status = query.status;
    if (query.priority) filter.priority = query.priority;
    // For agents/admins filtering by specific assignee
    if (query.assignedTo) {
        // If they are strictly filtering, we might need to respect that within their allowed scope
        // For simplicity, let's just add it to the filter object
        filter.assignedTo = query.assignedTo;
    }

    const tickets = await Ticket.find(filter)
        .populate('createdBy', 'name email')
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 });

    return tickets;
};

export const getTicketById = async (id, user) => {
    const ticket = await Ticket.findById(id)
        .populate('createdBy', 'name email')
        .populate('assignedTo', 'name email');

    if (!ticket) {
        throw new ApiError(404, 'Ticket not found');
    }

    // Access control: User can only see their own tickets
    if (user.role === 'user' && ticket.createdBy._id.toString() !== user._id.toString()) {
        throw new ApiError(403, 'Not authorized to view this ticket');
    }

    return ticket;
};

export const updateTicket = async (id, updateData, user) => {
    let ticket = await Ticket.findById(id);

    if (!ticket) {
        throw new ApiError(404, 'Ticket not found');
    }

    // User can only update their own tickets (and maybe only specific fields like description or closing it)
    // Agents/Admins can update everything
    if (user.role === 'user' && ticket.createdBy.toString() !== user._id.toString()) {
        throw new ApiError(403, 'Not authorized to update this ticket');
    }

    // AGENT RESTRICTIONS
    if (user.role === 'agent') {
        // Cannot change priority
        if (updateData.priority && updateData.priority !== ticket.priority) {
            throw new ApiError(403, 'Agents cannot change ticket priority');
        }
        // Cannot assign tickets to others (or themselves if not already? Spec says "Cannot Assign tickets")
        // If they try to change assignedTo
        if (updateData.assignedTo && updateData.assignedTo.toString() !== (ticket.assignedTo ? ticket.assignedTo.toString() : '')) {
            throw new ApiError(403, 'Agents cannot assign tickets');
        }
    }

    const oldValue = ticket.toObject();

    ticket = await Ticket.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    }).populate('createdBy', 'name email').populate('assignedTo', 'name email');

    // Detect important changes for logging (Status, Assignment)
    if (updateData.status && updateData.status !== oldValue.status) {
        await TicketLog.create({
            ticket: id,
            action: 'Status Updated',
            performedBy: user._id,
            oldValue: { status: oldValue.status },
            newValue: { status: updateData.status }
        });
    }

    if (updateData.assignedTo && updateData.assignedTo.toString() !== (oldValue.assignedTo ? oldValue.assignedTo.toString() : '')) {
        await TicketLog.create({
            ticket: id,
            action: 'Ticket Assigned',
            performedBy: user._id,
            oldValue: { assignedTo: oldValue.assignedTo },
            newValue: { assignedTo: updateData.assignedTo }
        });
    }

    // Generic log if it wasn't one of the above, or added as extra detail? 
    // keeping it simple for now, only logging critical transitions.

    return ticket;
};

export const deleteTicket = async (id, user) => {
    // Only Admin can delete tickets usually
    if (user.role !== 'admin' && user.role !== 'super-admin') {
        throw new ApiError(403, 'Not authorized to delete tickets');
    }
    const ticket = await Ticket.findByIdAndDelete(id);
    if (!ticket) {
        throw new ApiError(404, 'Ticket not found');
    }
    return ticket;
};

export const getTicketLogs = async (ticketId, user) => {
    // Re-using access control logic often is good, but let's trust the controller to check existence first? 
    // Actually, good practice to check access here too or assume controller did it. 
    // For safety let's just fetch it. Access check should be consistent with getTicketById.

    // Check ticket existence
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) throw new ApiError(404, 'Ticket not found');

    // Strict Access Check: Admin, Super-Admin AND Agents can see history (per spec)
    if (!['admin', 'super-admin', 'agent'].includes(user.role)) {
        throw new ApiError(403, 'Not authorized to view ticket history');
    }

    return await TicketLog.find({ ticket: ticketId })
        .populate('performedBy', 'name')
        .sort({ createdAt: -1 });
};
