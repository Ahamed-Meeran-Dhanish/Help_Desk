import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { getTickets, reset } from '../ticketSlice';
import { Plus, Ticket, CheckCircle, Clock } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, bg }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between transition-transform hover:-translate-y-1">
        <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${bg}`}>
            <Icon size={24} className={color} />
        </div>
    </div>
);

const DashboardPage = () => {
    const dispatch = useDispatch();
    const { tickets, isLoading, isError, message } = useSelector((state) => state.tickets);
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isError) console.log(message);
        dispatch(getTickets());
        return () => { dispatch(reset()); }
    }, [dispatch, isError, message]);

    if (isLoading) return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>;

    const openTickets = tickets.filter(t => t.status === 'Open').length;
    const resolvedTickets = tickets.filter(t => t.status === 'Resolved').length;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
                    <p className="text-slate-500 mt-1">Here's what's happening with your tickets today.</p>
                </div>
                <Link to="/new-ticket" className="inline-flex items-center justify-center space-x-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 f font-medium">
                    <Plus size={18} />
                    <span>New Ticket</span>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Tickets"
                    value={tickets.length}
                    icon={Ticket}
                    color="text-blue-600"
                    bg="bg-blue-50"
                />
                <StatCard
                    title="Open Tickets"
                    value={openTickets}
                    icon={Clock}
                    color="text-orange-500"
                    bg="bg-orange-50"
                />
                <StatCard
                    title="Resolved"
                    value={resolvedTickets}
                    icon={CheckCircle}
                    color="text-green-500"
                    bg="bg-green-50"
                />
            </div>

            {/* Recent Tickets Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 text-lg">Recent Tickets</h3>
                    <Link to="/tickets" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View all</Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                                <th className="px-6 py-4">Subject</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Priority</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {tickets.slice(0, 5).map((ticket) => (
                                <tr key={ticket._id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{ticket.subject}</div>
                                        <div className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{ticket.description}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                            ${ticket.status === 'Open' ? 'bg-orange-100 text-orange-700' :
                                                ticket.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                                                    'bg-slate-100 text-slate-700'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 
                                                ${ticket.status === 'Open' ? 'bg-orange-500' :
                                                    ticket.status === 'Resolved' ? 'bg-green-500' :
                                                        'bg-slate-500'}`}></span>
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
                                        {new Date(ticket.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link to={`/ticket/${ticket._id}`} className="text-slate-400 hover:text-blue-600 transition-colors font-medium text-sm">
                                            Manage
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {tickets.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center py-12 text-slate-400">
                                        <Ticket size={48} className="mx-auto mb-3 opacity-20" />
                                        <p>No tickets found yet.</p>
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

export default DashboardPage;
