import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { getTickets, reset } from '../ticketSlice';
import { Search, Filter, RefreshCw } from 'lucide-react';

const TicketsPage = () => {
    const dispatch = useDispatch();
    const { tickets, isLoading } = useSelector((state) => state.tickets);
    const { user } = useSelector((state) => state.auth);

    // Local state for client-side filtering (ideally would be server-side for scale)
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(getTickets());
        return () => { dispatch(reset()); };
    }, [dispatch]);

    const filteredTickets = tickets.filter(ticket => {
        const matchesStatus = filterStatus === 'All' || ticket.status === filterStatus;
        const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    if (isLoading) return <div className="p-8 text-center text-slate-500">Loading tickets...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-slate-800">All Tickets</h1>
                {user?.role !== 'agent' && (
                    <Link to="/new-ticket" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm font-medium">
                        + New Ticket
                    </Link>
                )}
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search tickets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter className="text-slate-400" size={18} />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Open">Open</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                    </select>

                    <button
                        onClick={() => dispatch(getTickets())}
                        className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition"
                        title="Refresh"
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            {/* Tickets Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4">Subject</th>
                                <th className="px-6 py-4">Requester</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Priority</th>
                                <th className="px-6 py-4">Department</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredTickets.map((ticket) => (
                                <tr key={ticket._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">{ticket.subject}</td>
                                    <td className="px-6 py-4 text-slate-600 font-medium text-sm">{ticket.createdBy?.name || 'Unknown'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border
                                            ${ticket.status === 'Open' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                                ticket.status === 'Resolved' ? 'bg-green-50 text-green-700 border-green-100' :
                                                    'bg-slate-50 text-slate-700 border-slate-200'}`}>
                                            {ticket.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-sm font-medium
                                            ${ticket.priority === 'High' ? 'text-red-500' :
                                                ticket.priority === 'Medium' ? 'text-yellow-600' : 'text-slate-500'}
                                        `}>
                                            {ticket.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {ticket.department || 'General'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {new Date(ticket.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link to={`/ticket/${ticket._id}`} className="text-blue-600 hover:underline font-medium text-sm">View</Link>
                                    </td>
                                </tr>
                            ))}
                            {filteredTickets.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="text-center py-12 text-slate-400">
                                        No tickets found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TicketsPage;
