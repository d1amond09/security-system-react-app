import React, { useState, useEffect } from 'react';
import { Cpu, Save, Loader2, CheckCircle } from 'lucide-react';
import axiosInstance, { SCANNER_API_URL } from '../api/axiosConfig';

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState({ apiKey: '', model: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        axiosInstance.get(`${SCANNER_API_URL}/settings/llm`)
            .then(res => setSettings(res.data))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true); setMessage('');
        try {
            await axiosInstance.put(`${SCANNER_API_URL}/settings/llm`, settings);
            setMessage('Настройки успешно сохранены');
        } catch (err) {
            setMessage('Ошибка сохранения');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Cpu className="text-purple-500" size={32} />
                <h1 className="text-3xl font-bold font-white">Настройки OpenRouter AI</h1>
            </div>
            <form onSubmit={handleSave} className="bg-slate-800 p-8 rounded-2xl border border-slate-700 space-y-6">
                {message && <div className="bg-blue-500/20 text-blue-300 p-3 rounded-lg flex items-center gap-2"><CheckCircle size={16} /> {message}</div>}
                <div>
                    <label className="block text-sm text-slate-400 mb-2">Google API Key</label>
                    <input type="password" value={settings.apiKey} onChange={e => setSettings({ ...settings, apiKey: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 outline-none focus:border-purple-500" required />
                </div>
                <div>
                    <label className="block text-sm text-slate-400 mb-2">Model Name</label>
                    <input type="text" value={settings.model} onChange={e => setSettings({ ...settings, model: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 outline-none focus:border-purple-500" required />
                </div>
                <button disabled={saving} className="w-full bg-purple-600 hover:bg-purple-500 p-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-colors">
                    {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />} Сохранить конфигурацию
                </button>
            </form>
        </div>
    );
}