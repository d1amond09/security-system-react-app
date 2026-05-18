import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { USER_API_URL } from '../api/axiosConfig';

export default function ConfirmEmail() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const confirmAccount = async () => {
            const userId = searchParams.get('userId');
            const token = searchParams.get('token');

            if (!userId || !token) {
                setStatus('error');
                setMessage('Некорректная ссылка подтверждения.');
                return;
            }

            try {
                const res = await axios.get(`${USER_API_URL}/auth/confirm-email`, {
                    params: { userId, token }
                });
                setStatus('success');
                setMessage(res.data.message || 'Email успешно подтвержден!');
            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.title || 'Ошибка подтверждения. Возможно, ссылка устарела.');
            }
        };

        confirmAccount();
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-center">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-700">
                {status === 'loading' && (
                    <div className="flex flex-col items-center text-slate-300">
                        <Loader2 size={48} className="animate-spin mb-4 text-blue-500" />
                        <h2 className="text-xl font-bold">Подтверждение...</h2>
                    </div>
                )}
                {status === 'success' && (
                    <div className="flex flex-col items-center text-slate-300">
                        <CheckCircle size={64} className="text-green-500 mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">Успех!</h2>
                        <p className="mb-6">{message}</p>
                        <Link to="/login" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold">Войти в систему</Link>
                    </div>
                )}
                {status === 'error' && (
                    <div className="flex flex-col items-center text-slate-300">
                        <XCircle size={64} className="text-red-500 mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">Ошибка</h2>
                        <p className="mb-6">{message}</p>
                        <Link to="/login" className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg font-bold">На главную</Link>
                    </div>
                )}
            </div>
        </div>
    );
}