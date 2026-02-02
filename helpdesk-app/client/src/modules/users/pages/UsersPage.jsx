import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUsers, deleteUser, updateUser, reset } from '../usersSlice';
import { Trash2, Edit2, Shield, User } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import UserModal from '../components/UserModal';

const UsersPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { users, isLoading, isError, message } = useSelector((state) => state.users);
    const { user: currentUser } = useSelector((state) => state.auth);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        if (isError) {
            toast.error(message);
        }

        // Protect route
        if (currentUser && currentUser.role !== 'admin' && currentUser.role !== 'super-admin') {
            toast.error('Not authorized');
            navigate('/');
        } else {
            dispatch(getUsers());
        }

        return () => { dispatch(reset()); };
    }, [dispatch, isError, message, currentUser, navigate]);

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            dispatch(deleteUser(id));
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleSaveUser = (id, userData) => {
        dispatch(updateUser({ id, userData }))
            .unwrap()
            .then(() => {
                toast.success('User updated successfully');
                setIsModalOpen(false);
                setEditingUser(null);
            })
            .catch(toast.error);
    };


    if (isLoading) return <div className="p-8 text-center text-slate-500">Loading users...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
                <div className="text-sm text-slate-500">Total Users: {users.length}</div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs font-semibold">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Department</th>
                            <th className="px-6 py-4">Joined</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map((user) => (
                            <tr key={user._id} className="hover:bg-slate-50/50 transition">
                                <td className="px-6 py-4 font-medium text-slate-900 flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                        {user.name.charAt(0)}
                                    </div>
                                    <span>{user.name}</span>
                                </td>
                                <td className="px-6 py-4 text-slate-600 font-medium text-sm">{user.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wide
                                        ${user.role === 'admin' || user.role === 'super-admin' ? 'bg-purple-100 text-purple-700' :
                                            user.role === 'manager' ? 'bg-blue-100 text-blue-700' :
                                                user.role === 'agent' ? 'bg-green-100 text-green-700' :
                                                    'bg-slate-100 text-slate-700'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500">{user.department || 'General'}</td>
                                <td className="px-6 py-4 text-sm text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 flex space-x-3">
                                    <button
                                        onClick={() => handleEdit(user)}
                                        className="text-slate-400 hover:text-blue-600 transition"
                                        title="Edit User"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user._id)}
                                        className="text-slate-400 hover:text-red-600 transition"
                                        title="Delete User"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                user={editingUser}
                onSave={handleSaveUser}
            />
        </div>
    );
};

export default UsersPage;
