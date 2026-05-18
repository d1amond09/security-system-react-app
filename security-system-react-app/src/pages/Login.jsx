import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Loader2 } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { USER_API_URL } from '../api/axiosConfig';
import axios from 'axios';

export default function Login() {
    const [loginIdentifier, setLoginIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const response = await axios.post(`${USER_API_URL}/auth/login`, {
                emailOrUserName: loginIdentifier, 
                password
            });
            login(response.data.accessToken);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.title || 'Ошибка входа.');
        } finally {
            setLoading(false);
        }
    };

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
            setError('Ошибка входа через Google.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-700">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-blue-600 p-3 rounded-xl mb-4"><Shield size={32} className="text-white" /></div>
                    <h2 className="text-2xl font-bold text-white">Вход в систему</h2>
                </div>
                {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg mb-6 text-sm">{error}</div>}

                <div className="mb-4 flex justify-center">

                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError('Ошибка входа через Google.')}
                            theme="filled_blue"
                            text="signin_with"
                            shape="pill"
                        />
                </div>
                <div className="flex items-center my-6">
                    <hr className="flex-grow border-slate-600" />
                    <span className="mx-4 text-slate-500 text-sm">ИЛИ</span>
                    <hr className="flex-grow border-slate-600" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-slate-400 mb-1 text-sm">Email или Username</label>
                        <input type="text" value={loginIdentifier} onChange={e => setLoginIdentifier(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-slate-400 text-sm">Пароль</label>
                            <Link to="/forgot-password" className="text-blue-400 hover:text-blue-300 text-sm">Забыли пароль?</Link>
                        </div>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-lg font-bold transition-colors flex justify-center items-center">
                        {loading ? <Loader2 className="animate-spin" /> : 'Войти'}
                    </button>
                </form>
                <div className="mt-6 text-center text-slate-400 text-sm">
                    Нет аккаунта? <Link to="/register" className="text-blue-400 hover:text-blue-300">Зарегистрироваться</Link>
                </div>
            </div>
        </div>
    );
}