import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getNotes, createNote, reset as notesReset } from '../noteSlice';
import NoteItem from '../components/NoteItem';
import { closeTicket, updateTicket } from '../ticketSlice'; // Thunk
import ticketService from '../ticket.service';
import { getUsers } from '../../users/usersSlice';
import TicketHistory from '../components/TicketHistory';

const TicketDetailsPage = () => {
    const { ticketId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Safe selection with fallback
    const noteState = useSelector((state) => state.notes);
    const notes = noteState?.notes || [];
    const notesIsLoading = noteState?.isLoading || false;

    const { user } = useSelector((state) => state.auth);
    const { users } = useSelector((state) => state.users);

    // Ticket state
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    // Note form state
    const [noteText, setNoteText] = useState('');

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                const data = await ticketService.getTicket(ticketId);
                setTicket(data);
            } catch (err) {
                console.error(err);
                toast.error('Could not fetch ticket');
                navigate('/tickets');
            } finally {
                setLoading(false);
            }
        };

        fetchTicket();
        dispatch(getNotes(ticketId));

        // Fetch users if admin/super-admin to allow assignment
        if (user && (user.role === 'admin' || user.role === 'super-admin')) {
            dispatch(getUsers());
        }

    }, [ticketId, navigate, dispatch, user?.role]);

    const onTicketClose = () => {
        if (window.confirm('Are you sure you want to close this ticket?')) {
            dispatch(closeTicket(ticketId))
                .unwrap()
                .then(() => {
                    toast.success('Ticket Closed Successfully');
                    setTicket(prev => ({ ...prev, status: 'Resolved' }));
                })
                .catch(toast.error);
        }
    }

    const onAssignChange = (e) => {
        const agentId = e.target.value;
        dispatch(updateTicket({ ticketId, ticketData: { assignedTo: agentId } }))
            .unwrap()
            .then((updatedTicket) => {
                toast.success(`Ticket assigned successfully`);
                setTicket(updatedTicket);
            })
            .catch(toast.error);
    };

    const onNoteSubmit = (e) => {
        e.preventDefault();
        if (!noteText) return;
        // ... (rest of note submit logic)
        dispatch(createNote({ ticketId, noteText }))
            .unwrap()
            .then(() => {
                toast.success('Note added');
                setNoteText('');
            })
            .catch(toast.error);
    };

    if (loading) return <div className="p-8 text-center">Loading Ticket...</div>;
    if (!ticket) return <div className="p-8 text-center">Ticket not found</div>;

    const isAdmin = user?.role === 'admin' || user?.role === 'super-admin';
    const agents = users.filter(u => u.role === 'agent' || u.role === 'admin' || u.role === 'super-admin' || u.role === 'manager');

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <header className="flex justify-between items-start">
                {/* ... (Header content same as before) ... */}
                <div>
                    <div className="flex items-center space-x-3 mb-2">
                        <h1 className="text-2xl font-bold text-slate-800">Ticket #{ticket._id ? ticket._id.slice(-6) : ''}</h1>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold
                            ${ticket.status === 'Open' ? 'bg-orange-100 text-orange-800' :
                                ticket.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                                    'bg-slate-100 text-slate-800'}`}>
                            {ticket.status}
                        </span>
                    </div>
                    <h2 className="text-xl font-medium text-slate-700">{ticket.subject}</h2>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="text-slate-500 hover:text-slate-700"
                >
                    &larr; Back
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                        <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Description</h3>
                        <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">
                            {ticket.description}
                        </p>
                    </div>

                    {/* Internal Notes - Staff Only */}
                    {user?.role !== 'user' && (
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                            {/* ... (Notes UI same as before) ... */}
                            <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Internal Notes (Staff Only)</h3>

                            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
                                {notes && notes.length > 0 ? (
                                    notes.map((note) => (
                                        <NoteItem key={note._id} note={note} />
                                    ))
                                ) : (
                                    <p className="text-center text-slate-400 italic py-4">No internal notes yet.</p>
                                )}
                            </div>

                            {ticket.status !== 'Closed' && (
                                <form onSubmit={onNoteSubmit}>
                                    <div className="flex flex-col space-y-2">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <input
                                                type="checkbox"
                                                id="isInternal"
                                                className="rounded text-blue-600 focus:ring-blue-500"
                                                defaultChecked={true}
                                                disabled
                                            />
                                            <label htmlFor="isInternal" className="text-xs text-slate-500">Internal Note (Private)</label>
                                        </div>
                                        <textarea
                                            className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                            placeholder="Add an internal note..."
                                            rows="3"
                                            value={noteText}
                                            onChange={(e) => setNoteText(e.target.value)}
                                        ></textarea>
                                        <div className="flex justify-end">
                                            <button
                                                type="submit"
                                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
                                                disabled={!noteText}
                                            >
                                                Add Note
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    {/* Ticket History - Admins & Agents */}
                    {(isAdmin || user?.role === 'agent') && (
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                            <TicketHistory ticketId={ticketId} />
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                        <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Ticket Info</h3>
                        <div className="space-y-3">
                            {/* Assigned To - Editable for Admin */}
                            <div>
                                <label className="block text-xs text-slate-500">Assigned To</label>
                                {isAdmin ? (
                                    <select
                                        className="w-full mt-1 border border-slate-300 rounded p-1.5 text-sm"
                                        value={ticket.assignedTo?._id || ticket.assignedTo || ''}
                                        onChange={onAssignChange}
                                    >
                                        <option value="">Unassigned</option>
                                        {agents.map(agent => (
                                            <option key={agent._id} value={agent._id}>
                                                {agent.name} ({agent.role})
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <p className="text-sm font-medium text-slate-800">
                                        {ticket.assignedTo?.name || 'Unassigned'}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs text-slate-500">Date Created</label>
                                <p className="text-sm font-medium">{new Date(ticket.createdAt).toLocaleString()}</p>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500">Priority</label>
                                <p className={`text-sm font-medium 
                                    ${ticket.priority === 'High' ? 'text-red-600' : 'text-slate-800'}
                                `}>{ticket.priority}</p>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500">Type</label>
                                <p className="text-sm font-medium text-slate-800">{ticket.type || 'Incident'}</p>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500">Department</label>
                                <p className="text-sm font-medium text-slate-800">{ticket.department || 'General'}</p>
                            </div>
                            <div className="pt-3 border-t border-slate-100">
                                <label className="block text-xs text-slate-500">Created By</label>
                                <p className="text-sm font-medium text-slate-800">{ticket.createdBy?.name || 'Unknown'}</p>
                                <p className="text-xs text-slate-500">{ticket.createdBy?.email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-3">
                        {ticket.status !== 'Closed' && (
                            <button
                                onClick={onTicketClose}
                                className="w-full bg-slate-800 text-white py-2 rounded hover:bg-slate-700 transition"
                            >
                                Close Ticket
                            </button>
                        )}
                        {ticket.status === 'Closed' && (
                            <button disabled className="w-full bg-slate-100 text-slate-400 py-2 rounded cursor-not-allowed">
                                Ticket Closed
                            </button>
                        )}
                        {/* Reopen Button for Admin? Optional */}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default TicketDetailsPage;
