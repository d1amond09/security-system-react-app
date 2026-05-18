import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { KeyRound, Loader2, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { USER_API_URL } from '../api/axiosConfig';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    useEffect(() => {
        if (!token || !email) {
            setError('Некорректная или устаревшая ссылка для сброса пароля.');
        }
    }, [token, email]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Пароли не совпадают.');
            return;
        }
        setLoading(true);
        setError('');

        try {
            await axios.post(`${USER_API_URL}/auth/reset-password`, { email, token, password, confirmPassword });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.title || 'Ошибка сброса пароля. Возможно, ссылка устарела.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <div className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-700 text-center">
                    <CheckCircle2 size={64} className="text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Пароль успешно изменен!</h2>
                    <p className="text-slate-400 mb-6">Теперь вы можете войти в систему с новым паролем.</p>
                    <Link to="/login" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold">Войти в систему</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-700">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-blue-600 p-3 rounded-xl mb-4"><KeyRound size={32} className="text-white" /></div>
                    <h2 className="text-2xl font-bold text-white">Создайте новый пароль</h2>
                </div>
                {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg mb-6 text-sm">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-slate-400 mb-1 text-sm">Новый пароль</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-slate-400 mb-1 text-sm">Подтвердите пароль</label>
                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <button type="submit" disabled={loading || !token} className="w-full bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-lg font-bold transition-colors flex justify-center items-center disabled:opacity-50">
                        {loading ? <Loader2 className="animate-spin" /> : 'Сбросить пароль'}
                    </button>
                </form>
            </div>
        </div>
    );
}