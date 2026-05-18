import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, LogOut, User, Settings, ShieldCheck, ChevronDown, History, Cpu } from 'lucide-react';
import axiosInstance, { USER_API_URL } from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

export default function Header() {
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [pictureUrl, setPictureUrl] = useState(null);
    const menuRef = useRef(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await axiosInstance.get(`${USER_API_URL}/users/me`);
                console.log(res.data);
                setPictureUrl(res.data.pictureUrl);
            } catch (e) {
                console.error(e);
            }
        };
        if (user) fetchUserData();
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const roleKey = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
    const roles = user ? (user[roleKey] || user.role || []) : [];
    const isAdmin = Array.isArray(roles) ? roles.includes('Admin') : roles === 'Admin';

    return (
        <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="bg-blue-600 p-2 rounded-lg">
                        <Search size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white leading-none">AI Scanner</h1>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Security System</p>
                    </div>
                </Link>

                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="flex items-center gap-2 p-1 pr-3 rounded-full bg-slate-900 border border-slate-700 hover:border-slate-500 transition-colors"
                    >
                        <div className="bg-blue-500 h-8 w-8 rounded-full flex items-center justify-center text-white font-bold overflow-hidden">
                            {pictureUrl ? (
                                <img src={pictureUrl} alt="Me" className="w-full h-full object-cover" />
                            ) : (
                                (user?.unique_name || user?.email || 'U')[0].toUpperCase()
                            )}
                        </div>

                        <span className="text-sm font-medium text-slate-300 hidden md:block px-1">
                            {user?.unique_name || user?.email}
                        </span>
                        <ChevronDown size={16} className={`text-slate-500 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 overflow-hidden">
                            <Link to="/history" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                                <History size={16} /> История сканов
                            </Link>
                            <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                                <Settings size={16} /> Настройки профиля
                            </Link>
                            {isAdmin && (
                                <>
                                    <hr className="my-1 border-slate-700" />
                                    <Link to="/admin/settings" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-purple-400 hover:bg-slate-700 hover:text-purple-300 transition-colors">
                                        <Cpu size={16} /> Настройки ИИ
                                    </Link>
                                    <Link to="/admin/users" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-purple-400 hover:bg-slate-700 hover:text-purple-300 transition-colors">
                                        <ShieldCheck size={16} /> Пользователи
                                    </Link>
                                </>
                            )}
                            <hr className="my-1 border-slate-700" />
                            <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                                <LogOut size={16} /> Выйти
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}