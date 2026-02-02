import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { login, reset } from '../authSlice';
import { toast } from 'react-toastify';
import { Lock, Mail, ArrowRight } from 'lucide-react';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const { email, password } = formData;

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user, isLoading, isError, isSuccess, message } = useSelector(
        (state) => state.auth
    );

    useEffect(() => {
        if (isError) {
            toast.error(message);
        }

        if (isSuccess || user) {
            navigate('/');
        }

        dispatch(reset());
    }, [user, isError, isSuccess, message, navigate, dispatch]);

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        const userData = { email, password };
        dispatch(login(userData));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-slate-900 z-0"></div>
            <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex overflow-hidden z-10 relative">

                {/* Left Side - Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12">
                    <div className="flex items-center space-x-2 mb-8">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">H</div>
                        <span className="text-xl font-bold">HelpDesk</span>
                    </div>

                    <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome Back</h2>
                    <p className="text-slate-500 mb-8">Please enter your details to sign in.</p>

                    <form className="space-y-5" onSubmit={onSubmit}>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="email"
                                    name="email"
                                    value={email}
                                    onChange={onChange}
                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="password"
                                    name="password"
                                    value={password}
                                    onChange={onChange}
                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <span className="text-slate-600">Remember me</span>
                            </label>
                            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">Forgot password?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition-all flex items-center justify-center space-x-2 group shadow-lg shadow-slate-900/20"
                        >
                            <span>{isLoading ? 'Signing in...' : 'Sign In'}</span>
                            {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-slate-600">
                        Don't have an account? <Link to="/register" className="font-bold text-blue-600 hover:text-blue-500">Create account</Link>
                    </p>
                </div>

                {/* Right Side - Image */}
                <div className="hidden md:block w-1/2 bg-cover bg-center relative" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1632&q=80')" }}>
                    <div className="absolute inset-0 bg-blue-600/80 mix-blend-multiply"></div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12 text-center">
                        <h3 className="text-3xl font-bold mb-4">Streamline Your Support</h3>
                        <p className="text-blue-100 text-lg">Manage tickets, track performance, and delight your customers with our modern helpdesk solution.</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default LoginPage;
