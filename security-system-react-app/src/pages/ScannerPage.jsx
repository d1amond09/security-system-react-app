import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, GitBranch, Code2, Search, Info, ShieldX, FileUp, Paperclip, LogOut, UserCog, User, Globe } from 'lucide-react';
import VulnerabilityDetails from '../components/VulnerabilityDetails';
import axiosInstance, { SCANNER_API_URL } from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

const LANGUAGES = [
    { id: 'auto', name: '✨ Автоопределение' },
    { id: 'csharp', name: 'C#' },
    { id: 'python', name: 'Python' },
    { id: 'javascript', name: 'JavaScript' },
    { id: 'typescript', name: 'TypeScript' },
    { id: 'java', name: 'Java' },
    { id: 'go', name: 'Go' },
];

export default function ScannerPage() {
    const [activeTab, setActiveTab] = useState('snippet');
    const [sourceCode, setSourceCode] = useState('');
    const [repoUrl, setRepoUrl] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [vulnerabilities, setVulnerabilities] = useState([]);
    const [initialLoad, setInitialLoad] = useState(true);
    const fileInputRef = useRef(null);
    const [branch, setBranch] = useState('master'); 
    const [selectedLang, setSelectedLang] = useState('auto');

    const { logout, user } = useAuth();

    const roleKey = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
    const roles = user ? (user[roleKey] || user.role || []) : [];
    const isAdmin = Array.isArray(roles) ? roles.includes('Admin') : roles === 'Admin';


    const fetchVulnerabilities = async () => {
        try {
            const res = await axiosInstance.get(`${SCANNER_API_URL}/vulnerabilities`);
            setVulnerabilities(res.data);
        } catch (e) {
            setError("Не удалось загрузить данные с сервера.");
        } finally {
            setInitialLoad(false);
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) setSelectedFile(file);
    };

    const handleAnalyze = async (e) => {
        e.preventDefault();
        setLoading(true); setError(null); setVulnerabilities([]);
        try {
            let res;
            if (activeTab === 'file') {
                const formData = new FormData();
                formData.append('file', selectedFile);
                res = await axiosInstance.post(`${SCANNER_API_URL}/analyze/file`, formData);
            } else if (activeTab === 'snippet') {
                res = await axiosInstance.post(`${SCANNER_API_URL}/analyze/snippet`, {
                    language: selectedLang,
                    sourceCode
                });
            } else {
                res = await axiosInstance.post(`${SCANNER_API_URL}/analyze/project`, {
                    repositoryUrl: repoUrl,
                    branch: branch,
                    language: selectedLang === 'auto' ? 'csharp' : selectedLang
                });
            }
            setVulnerabilities(res.data);
        } catch (err) {
            setError(err.response?.data?.title || 'Ошибка при выполнении анализа. Попробуйте позже.');
        } finally {
            setLoading(false);
        }
    };

    const renderResults = () => {
        if (loading || initialLoad) {
            return null;
        }

        if (error) {
            return (
                <div className="bg-red-900/50 border border-red-500 text-red-300 p-4 rounded-xl flex items-center gap-4">
                    <ShieldX />
                    <div>
                        <h3 className="font-bold">Произошла ошибка</h3>
                        <p>{error}</p>
                    </div>
                </div>
            );
        }

        if (vulnerabilities.length > 0) {
            return (
                <div className="flex flex-col gap-8">
                    {vulnerabilities.map((vuln) => (
                        <VulnerabilityDetails key={vuln.id} vuln={vuln} />
                    ))}
                </div>
            );
        }

        return (
            <div className="bg-slate-800 border-dashed border-2 border-slate-600 p-8 rounded-2xl flex flex-col items-center text-center">
                <Info className="text-slate-500 mb-4" size={48} />
                <h3 className="text-xl font-semibold text-slate-300">Уязвимостей не найдено</h3>
                <p className="text-slate-400 max-w-md mt-2">
                    Система не обнаружила критических уязвимостей в предоставленном коде, либо анализ еще не был запущен.
                </p>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 font-sans p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <section className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
                    <div className="flex gap-4 mb-6">
                        <button
                            onClick={() => setActiveTab('snippet')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'snippet' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                        >
                            <Code2 size={18} /> Анализ Сниппета
                        </button>
                        <button
                            onClick={() => setActiveTab('github')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'github' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                        >
                            <GitBranch size={18} /> Анализ GitHub
                        </button>
                        <button
                            onClick={() => setActiveTab('file')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'file' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                        >
                            <FileUp size={18} /> Анализ Файла
                        </button>

                        <div className="grow flex justify-end">
                            <div className="flex items-center gap-2">
                                <Globe size={16} className="text-slate-500" />
                                <select
                                    value={selectedLang}
                                    onChange={(e) => setSelectedLang(e.target.value)}
                                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                                >
                                    {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleAnalyze} className="flex flex-col gap-4">
                        {activeTab === 'snippet' && (
                            <textarea
                                className="w-full h-48 bg-slate-950 border border-slate-700 rounded-xl p-4 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                                placeholder="// Вставьте исходный код сюда..."
                                value={sourceCode}
                                onChange={(e) => setSourceCode(e.target.value)}
                                required
                            />
                        )}
                        {activeTab === 'github' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-xs text-slate-500 uppercase font-bold mb-1 ml-1">URL Репозитория</label>
                                    <input type="url" className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 outline-none focus:border-blue-500" placeholder="https://github.com/user/repo" value={repoUrl} onChange={e => setRepoUrl(e.target.value)} required />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-500 uppercase font-bold mb-1 ml-1">Ветка</label>
                                    <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 outline-none focus:border-blue-500" placeholder="master" value={branch} onChange={e => setBranch(e.target.value)} required />
                                </div>
                            </div>
                        )}
                        {activeTab === 'file' && (
                            <div className="flex flex-col items-center justify-center w-full">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current.click()}
                                    className="w-full flex flex-col items-center justify-center p-6 border-2 border-slate-600 border-dashed rounded-xl cursor-pointer hover:bg-slate-700/50"
                                >
                                    <FileUp className="h-10 w-10 text-slate-500 mb-2" />
                                    <span className="font-semibold text-slate-300">Нажмите, чтобы выбрать файл</span>
                                    <span className="text-xs text-slate-400">Язык будет определен автоматически</span>
                                </button>
                                {selectedFile && (
                                    <div className="mt-4 flex items-center gap-2 text-slate-300">
                                        <Paperclip size={16} />
                                        <span>{selectedFile.name}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <button disabled={loading} className="w-full md:w-auto self-end bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                            {loading ? <Loader2 className="animate-spin" /> : <Search />} {loading ? 'Анализируем...' : 'Запустить скан'}
                        </button>
                    </form>
                </section>

                <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-white border-l-4 border-blue-500 pl-3">
                        Результаты анализа
                    </h2>
                    {renderResults()}
                </section>
            </div>
        </div>
    );
}