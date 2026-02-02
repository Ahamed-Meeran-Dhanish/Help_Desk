import api from '../../services/api';

const createTicket = async (ticketData) => {
    const response = await api.post('/tickets', ticketData);
    return response.data.data;
};

const getTickets = async () => {
    const response = await api.get('/tickets');
    return response.data.data;
};

const getTicket = async (ticketId) => {
    const response = await api.get(`/tickets/${ticketId}`);
    return response.data.data;
};

const updateTicket = async (ticketId, ticketData) => {
    const response = await api.put(`/tickets/${ticketId}`, ticketData);
    return response.data.data;
};

const deleteTicket = async (ticketId) => {
    const response = await api.delete(`/tickets/${ticketId}`);
    return response.data.data;
};

// Update ticket status (e.g., Close)
// Close ticket
const closeTicket = async (ticketId) => {
    const response = await api.put(`/tickets/${ticketId}`, { status: 'Closed' });
    return response.data.data;
};

// Assign ticket to a user
const assignTicket = async (ticketId, userId) => {
    const response = await api.put(`/tickets/${ticketId}`, { assignedTo: userId });
    return response.data.data;
};

// Get ticket history
const getTicketHistory = async (ticketId) => {
    const response = await api.get(`/tickets/${ticketId}/history`);
    return response.data.data;
};

const ticketService = {
    createTicket,
    getTickets,
    getTicket,
    updateTicket,
    deleteTicket,
    closeTicket,
    assignTicket,
    getTicketHistory,
};

export default ticketService;
