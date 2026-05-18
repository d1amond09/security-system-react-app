import React, { useState, useEffect, useRef } from 'react';
import { User, Loader2, Save, CheckCircle, Camera, Trash2 } from 'lucide-react';
import axiosInstance, { USER_API_URL } from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function ProfilePage() {
    const [formData, setFormData] = useState({ firstName: '', lastName: '', userName: '' });
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await axiosInstance.get(`${USER_API_URL}/users/me`);
                setFormData({
                    firstName: res.data.firstName || '',
                    lastName: res.data.lastName || '',
                    userName: res.data.userName || ''
                });

                setAvatarUrl(res.data.pictureUrl || null); 
            } catch (err) {
                setError('Не удалось загрузить данные профиля.');
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formDataFile = new FormData();
        formDataFile.append('file', file);

        setAvatarLoading(true);
        setError('');
        try {
            const res = await axiosInstance.post(`${USER_API_URL}/users/avatar`, formDataFile, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setAvatarUrl(res.data.url); 
            setSuccess('Фото профиля обновлено!');
        } catch (err) {
            setError('Ошибка при загрузке фото.');
        } finally {
            setAvatarLoading(false);
        }
    };

    const handleAvatarDelete = async () => {
        if (!window.confirm('Удалить фото профиля?')) return;

        setAvatarLoading(true);
        try {
            await axiosInstance.delete(`${USER_API_URL}/users/avatar`);
            setAvatarUrl(null);
            setSuccess('Фото профиля удалено.');
        } catch (err) {
            setError('Ошибка при удалении фото.');
        } finally {
            setAvatarLoading(false);
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            await axiosInstance.put(`${USER_API_URL}/users/me`, formData);
            setSuccess('Профиль успешно обновлен! Изменения вступят в силу при следующем входе.');
        } catch (err) {
            setError(err.response?.data?.title || 'Ошибка обновления. Возможно, username уже занят.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={48} /></div>;
    }

    return (
        <div className="min-h-screen bg-slate-900 p-8 flex justify-center">
            <div className="w-full max-w-2xl">
                <header className="flex items-center gap-4 border-b border-slate-700 pb-6 mb-8">
                    <div className="bg-blue-600 p-3 rounded-xl"><User size={32} className="text-white" /></div>
                    <h1 className="text-3xl font-extrabold text-white">Настройки профиля</h1>
                </header>

                <div className="bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700 space-y-8">

                    <div className="flex flex-col items-center gap-4">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-700 bg-slate-900 flex items-center justify-center relative">
                                {avatarLoading ? (
                                    <Loader2 className="animate-spin text-blue-500" size={32} />
                                ) : avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={64} className="text-slate-600" />
                                )}
                            </div>

                            <button
                                onClick={() => fileInputRef.current.click()}
                                className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-500 p-2 rounded-full text-white shadow-lg transition-colors"
                                title="Изменить фото"
                            >
                                <Camera size={20} />
                            </button>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleAvatarUpload}
                                className="hidden"
                                accept="image/*"
                            />
                        </div>

                        {avatarUrl && (
                            <button
                                onClick={handleAvatarDelete}
                                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                            >
                                <Trash2 size={14} /> Удалить фото
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg text-sm">{error}</div>}
                        {success && <div className="bg-green-500/20 border border-green-500 text-green-300 p-3 rounded-lg text-sm flex items-center gap-2"><CheckCircle size={16} /> {success}</div>}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-slate-400 mb-1 text-sm">Имя</label>
                                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-slate-400 mb-1 text-sm">Фамилия</label>
                                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-slate-400 mb-1 text-sm">Username</label>
                            <input type="text" name="userName" value={formData.userName} onChange={handleChange} required className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div className="flex justify-end items-center gap-4 pt-4">
                            <Link to="/" className="text-slate-400 hover:text-white">Назад</Link>
                            <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors disabled:opacity-50">
                                {saving ? <Loader2 className="animate-spin" /> : <Save />}
                                {saving ? 'Сохранение...' : 'Сохранить изменения'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}