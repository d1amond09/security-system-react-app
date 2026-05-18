import React from 'react';
import { ShieldBan, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function BlockedPage() {
    const { logout } = useAuth();
    const navigate = useNavigate(); 

    const handleLogout = () => {
        logout(); 
        navigate('/login', { replace: true }); 
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-center">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-red-500/30">
                <ShieldBan size={64} className="text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Доступ ограничен</h2>
                <p className="text-slate-400 mb-6">
                    Ваша учетная запись была заблокирована администратором за нарушение правил системы.
                </p>
                <button
                    onClick={handleLogout}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg font-bold flex items-center justify-center mx-auto gap-2"
                >
                    <LogOut size={18} /> Выйти из аккаунта
                </button>
            </div>
        </div>
    );
}