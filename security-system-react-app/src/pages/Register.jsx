import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Loader2, CheckCircle2 } from 'lucide-react';
import { USER_API_URL } from '../api/axiosConfig';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

export default function Register() {
    const [formData, setFormData] = useState({ firstName: '', lastName: '', userName: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true); setError('');
        try {
            const response = await axios.post(`${USER_API_URL}/auth/google`, {
                provider: "Google",
                idToken: credentialResponse.credential
            });
            login(response.data.accessToken);
            navigate('/');
        } catch (err) {
            setError('Ошибка регистрации через Google.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');

        const clientUri = `${window.location.origin}/confirm-email`;

        try {
            await axios.post(`${USER_API_URL}/auth/register`, { ...formData, clientUri });
            setSuccess(true);
        } catch (err) {
            const errData = err.response?.data;
            if (errData?.errors) {
                const messages = Object.values(errData.errors).flat().join(' ');
                setError(messages);
            } else {
                setError('Ошибка при регистрации. Проверьте данные.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <div className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-700 text-center">
                    <CheckCircle2 size={64} className="text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Регистрация успешна!</h2>
                    <p className="text-slate-400 mb-6">Мы отправили письмо для подтверждения на ваш email.</p>
                    <Link to="/login" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold">Вернуться ко входу</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-700">

                <div className="flex flex-col items-center mb-6">
                    <div className="bg-blue-600 p-3 rounded-xl mb-4"><Shield size={32} className="text-white" /></div>
                    <h2 className="text-2xl font-bold text-white">Регистрация</h2>
                </div>

                <div className="mb-4 flex justify-center">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError('Ошибка Google.')}
                        theme="filled_blue"
                        text="signup_with"
                        shape="pill"
                    />
                </div>

                <div className="flex items-center my-6">
                    <hr className="flex-grow border-slate-700" />
                    <span className="mx-4 text-slate-500 text-xs uppercase">или через почту</span>
                    <hr className="flex-grow border-slate-700" />
                </div>

                {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg mb-6 text-sm">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-slate-400 mb-1 text-sm">Имя</label>
                            <input type="text" name="firstName" onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-slate-400 mb-1 text-sm">Фамилия</label>
                            <input type="text" name="lastName" onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-slate-400 mb-1 text-sm">Username *</label>
                        <input type="text" name="userName" required onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-slate-400 mb-1 text-sm">Email *</label>
                        <input type="email" name="email" required onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-slate-400 mb-1 text-sm">Пароль *</label>
                        <input type="password" name="password" required onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-slate-400 mb-1 text-sm">Подтвердите пароль *</label>
                        <input type="password" name="confirmPassword" required onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-lg font-bold transition-colors flex justify-center items-center mt-4">
                        {loading ? <Loader2 className="animate-spin" /> : 'Зарегистрироваться'}
                    </button>
                </form>
                <div className="mt-4 text-center text-slate-400 text-sm">
                    Уже есть аккаунт? <Link to="/login" className="text-blue-400 hover:text-blue-300">Войти</Link>
                </div>
            </div>
        </div>
    );
}