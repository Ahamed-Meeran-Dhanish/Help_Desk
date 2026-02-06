import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createTicket, reset } from '../ticketSlice';
import { toast } from 'react-toastify';

const CreateTicketPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user } = useSelector((state) => state.auth);
    const { isLoading, message } = useSelector((state) => state.tickets);

    const [formData, setFormData] = useState({
        product: 'General',
        description: '',
        subject: '',
        priority: 'Medium',
        type: 'Incident',
    });

    const { product, description, subject, priority, type } = formData;

    // Clear state on mount to ensure a clean slate
    useEffect(() => {
        dispatch(reset());
    }, [dispatch]);

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        try {
            // This await was hanging because the reducer crashed
            await dispatch(createTicket({ product, description, subject, priority, type })).unwrap();
            
            toast.success('Ticket created successfully!');
            dispatch(reset());
            navigate('/'); // This will now trigger
        } catch (error) {
            toast.error(error || 'Failed to create ticket');
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-slate-200">
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-slate-800">Create New Ticket</h1>
                <p className="text-slate-600">Please fill out the form below</p>
            </div>

            <div className="mb-6 p-4 bg-slate-50 rounded border border-slate-100">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-slate-500 uppercase font-bold">Customer Name</label>
                        <p className="text-slate-800 font-medium">{user?.name}</p>
                    </div>
                    <div>
                        <label className="block text-xs text-slate-500 uppercase font-bold">Customer Email</label>
                        <p className="text-slate-800 font-medium">{user?.email}</p>
                    </div>
                </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
                <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                    <input
                        type="text"
                        name="subject"
                        id="subject"
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Brief summary of the issue"
                        value={subject}
                        onChange={onChange}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-slate-700 mb-1">Ticket Type</label>
                        <select
                            name="type"
                            id="type"
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                            value={type}
                            onChange={onChange}
                        >
                            <option value="Incident">Incident</option>
                            <option value="Service Request">Service Request</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="priority" className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                        <select
                            name="priority"
                            id="priority"
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                            value={priority}
                            onChange={onChange}
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <textarea
                        name="description"
                        id="description"
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none h-32 resize-none"
                        placeholder="Describe the issue in detail"
                        value={description}
                        onChange={onChange}
                        required
                    ></textarea>
                </div>

                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        disabled={isLoading} // Disable while loading
                        onClick={() => navigate('/')}
                        className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading} // Disable while loading
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition shadow-sm disabled:opacity-50 min-w-[140px]"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Submitting...
                            </span>
                        ) : (
                            'Submit Ticket'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateTicketPage;
