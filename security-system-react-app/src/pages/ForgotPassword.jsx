import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Loader2, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { USER_API_URL } from '../api/axiosConfig';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const clientUri = `${window.location.origin}/reset-password`;

        try {
            await axios.post(`${USER_API_URL}/auth/forgot-password`, { email, clientUri });
            setSuccess(true);
        } catch (err) {
            setError('Произошла ошибка. Убедитесь, что email введен верно.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <div className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-700 text-center">
                    <CheckCircle2 size={64} className="text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Проверьте почту</h2>
                    <p className="text-slate-400 mb-6">Если аккаунт с таким email существует, мы отправили на него ссылку для сброса пароля.</p>
                    <Link to="/login" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold">Вернуться ко входу</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-700">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-blue-600 p-3 rounded-xl mb-4"><Mail size={32} className="text-white" /></div>
                    <h2 className="text-2xl font-bold text-white">Сброс пароля</h2>
                    <p className="text-slate-400 text-center mt-2">Введите ваш email, и мы отправим ссылку для восстановления.</p>
                </div>
                {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg mb-6 text-sm">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-slate-400 mb-1 text-sm">Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-lg font-bold transition-colors flex justify-center items-center">
                        {loading ? <Loader2 className="animate-spin" /> : 'Отправить'}
                    </button>
                </form>
                <div className="mt-6 text-center text-slate-400 text-sm">
                    Вспомнили пароль? <Link to="/login" className="text-blue-400 hover:text-blue-300">Войти</Link>
                </div>
            </div>
        </div>
    );
}