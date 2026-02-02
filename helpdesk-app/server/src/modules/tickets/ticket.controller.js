import * as ticketService from './ticket.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';

// @desc    Create new ticket
// @route   POST /api/v1/tickets
// @access  Private
export const createTicket = async (req, res, next) => {
    try {
        const ticket = await ticketService.createTicket(req.body, req.user._id);
        res.status(201).json(new ApiResponse(201, ticket, 'Ticket created successfully'));
    } catch (error) {
        next(error);
    }
};

// @desc    Get all tickets
// @route   GET /api/v1/tickets
// @access  Private
export const getAllTickets = async (req, res, next) => {
    try {
        const tickets = await ticketService.getAllTickets(req.query, req.user);
        res.status(200).json(new ApiResponse(200, tickets, 'Tickets retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

// @desc    Get single ticket
// @route   GET /api/v1/tickets/:id
// @access  Private
export const getTicket = async (req, res, next) => {
    try {
        const ticket = await ticketService.getTicketById(req.params.id, req.user);
        res.status(200).json(new ApiResponse(200, ticket, 'Ticket retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

// @desc    Update ticket
// @route   PUT /api/v1/tickets/:id
// @access  Private
export const updateTicket = async (req, res, next) => {
    try {
        const ticket = await ticketService.updateTicket(req.params.id, req.body, req.user);
        res.status(200).json(new ApiResponse(200, ticket, 'Ticket updated successfully'));
    } catch (error) {
        next(error);
    }
};

// @desc    Delete ticket
// @route   DELETE /api/v1/tickets/:id
// @access  Private (Admin only)
export const deleteTicket = async (req, res, next) => {
    try {
        await ticketService.deleteTicket(req.params.id, req.user);
        res.status(200).json(new ApiResponse(200, null, 'Ticket deleted successfully'));
    } catch (error) {
        next(error);
    }
};

// @desc    Get ticket history
// @route   GET /api/v1/tickets/:id/history
// @access  Private
export const getTicketHistory = async (req, res, next) => {
    try {
        const history = await ticketService.getTicketLogs(req.params.id, req.user);
        res.status(200).json(new ApiResponse(200, history, 'Ticket history retrieved successfully'));
    } catch (error) {
        next(error);
    }
};
