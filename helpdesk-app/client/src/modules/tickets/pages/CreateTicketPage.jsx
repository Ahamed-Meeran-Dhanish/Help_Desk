import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createTicket, reset } from '../ticketSlice';

const CreateTicketPage = () => {
    const { user } = useSelector((state) => state.auth);
    const { isLoading, isError, isSuccess, message } = useSelector(
        (state) => state.tickets
    );

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [name] = useState(user.name);
    const [email] = useState(user.email);

    // Redirect if agent
    React.useEffect(() => {
        if (user && user.role === 'agent') {
            navigate('/');
        }
    }, [user, navigate]);

    const [formData, setFormData] = useState({
        product: 'General', // We didn't define Product in model, but good for UI. We'll map to 'type' or just ignore
        description: '',
        subject: '',
        priority: 'Medium',
        type: 'Incident',
    });

    const { product, description, subject, priority, type } = formData;

    const onSubmit = (e) => {
        e.preventDefault();
        dispatch(createTicket({ product, description, subject, priority, type }));
        navigate('/');
    };

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-slate-200">
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-slate-800">Create New Ticket</h1>
                <p className="text-slate-600">Please fill out the form below</p>
            </div>

            <div className="mb-6 p-4 bg-slate-50 rounded border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-slate-500 uppercase font-bold">Customer Name</label>
                        <p className="text-slate-800 font-medium">{name}</p>
                    </div>
                    <div>
                        <label className="block text-xs text-slate-500 uppercase font-bold">Customer Email</label>
                        <p className="text-slate-800 font-medium">{email}</p>
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
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                        placeholder="Brief summary of the issue"
                        value={subject}
                        onChange={onChange}
                        required
                        maxLength={100}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-slate-700 mb-1">Ticket Type</label>
                        <select
                            name="type"
                            id="type"
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none bg-white"
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
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none bg-white"
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
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none h-32 resize-none"
                        placeholder="Describe the issue in detail"
                        value={description}
                        onChange={onChange}
                        required
                    ></textarea>
                </div>

                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-primary text-white rounded-md hover:bg-blue-700 transition shadow-sm"
                    >
                        Submit Ticket
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateTicketPage;
