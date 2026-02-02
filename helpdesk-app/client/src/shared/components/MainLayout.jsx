import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Ticket, Users, BarChart3, LogOut, Bell, Search } from 'lucide-react';
import { logout, reset } from '../../modules/auth/authSlice';

const MainLayout = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const onLogout = () => {
        dispatch(logout());
        dispatch(reset());
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col shadow-xl z-10 transition-all duration-300">
                <div className="p-6 flex items-center space-x-3 border-b border-slate-800/50">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30">
                        H
                    </div>
                    <span className="text-xl font-bold tracking-tight">HelpDesk</span>
                </div>

                <nav className="flex-1 p-4 space-y-2 mt-4">
                    <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Menu</p>

                    <Link to="/" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group
                ${isActive('/') ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                        <LayoutDashboard size={20} />
                        <span className="font-medium">Dashboard</span>
                    </Link>

                    <Link to="/tickets" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200 group">
                        <Ticket size={20} />
                        <span className="font-medium">Tickets</span>
                    </Link>

                    <Link to="/reports" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200 group">
                        <BarChart3 size={20} />
                        <span className="font-medium">Reports</span>
                    </Link>

                    {/* Admin Only Link */}
                    {(user?.role === 'admin' || user?.role === 'super-admin') && (
                        <Link to="/users" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group
                            ${isActive('/users') ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                            <Users size={20} />
                            <span className="font-medium">Users</span>
                        </Link>
                    )}
                </nav>

                <div className="p-4 border-t border-slate-800/50">
                    <div className="flex items-center p-3 space-x-3 bg-slate-800/50 rounded-xl mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user?.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={onLogout}
                        className="flex items-center justify-center space-x-2 w-full px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <LogOut size={16} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-slate-200/60 px-8 py-4 flex justify-between items-center shadow-sm">
                    <div className="flex items-center w-96 bg-slate-100 rounded-full px-4 py-2 border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                        <Search size={18} className="text-slate-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Search tickets..."
                            className="bg-transparent border-none focus:outline-none text-sm w-full text-slate-700 placeholder:text-slate-400"
                        />
                    </div>

                    <div className="flex items-center space-x-6">
                        <button className="relative p-2 text-slate-500 hover:text-blue-600 transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                        </button>
                        <div className="h-8 w-px bg-slate-200"></div>
                        <div className="text-right">
                            <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                            <p className="text-xs text-slate-500 font-medium capitalize">{user?.role || 'User'}</p>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-auto p-8 relative">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
