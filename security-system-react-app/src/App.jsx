import React, { useState, useEffect, useRef } from 'react';
import { Loader2, GitBranch, Code2, Search, Info, ShieldX, FileUp, Paperclip } from 'lucide-react';
import VulnerabilityDetails from './components/VulnerabilityDetails';

const API_BASE = 'https://localhost:7039/api/v1';

export default function App() {
    const [activeTab, setActiveTab] = useState('snippet');
    const [sourceCode, setSourceCode] = useState('');
    const [repoUrl, setRepoUrl] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [vulnerabilities, setVulnerabilities] = useState([]);
    const [initialLoad, setInitialLoad] = useState(true);
    const fileInputRef = useRef(null);

    const fetchVulnerabilities = async () => {
        try {
            const res = await fetch(`${API_BASE}/vulnerabilities`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            setVulnerabilities(data);
        } catch (e) {
            console.error("Failed to fetch", e);
            setError("Не удалось загрузить данные с сервера. Проверьте, запущен ли бекенд.");
        } finally {
            setInitialLoad(false);
        }
    };

    useEffect(() => { fetchVulnerabilities(); }, []);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) setSelectedFile(file);
    };

    const handleAnalyze = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setVulnerabilities([]);

        try {
            let endpoint = '';
            let requestOptions = {};

            if (activeTab === 'file') {
                endpoint = '/analyze/file';
                const formData = new FormData();
                formData.append('file', selectedFile);
                requestOptions = { method: 'POST', body: formData };
            } else {
                endpoint = activeTab === 'snippet' ? '/analyze/snippet' : '/analyze/project';
                const body = activeTab === 'snippet'
                    ? { language: 'csharp', sourceCode }
                    : { repositoryUrl: repoUrl, branch: 'main', language: 'csharp' };
                requestOptions = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                };
            }

            const analyzeRes = await fetch(`${API_BASE}${endpoint}`, requestOptions);

            if (!analyzeRes.ok) {
                throw new Error(`Server responded with ${analyzeRes.status}`);
            }
            await fetchVulnerabilities();
        } catch (error) {
            console.error(error);
            setError('Ошибка при анализе. Проверьте URL бекенда в консоли (F12) или его логи.');
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
                    <header className="flex items-center gap-4 border-b border-slate-700 pb-6">
                        <div className="bg-blue-600 p-3 rounded-xl"><Search size={32} className="text-white" /></div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-white">AI Security Scanner</h1>
                            <p className="text-slate-400">Deep Taint-Analysis & Automated Remediation System</p>
                        </div>
                    </header>

                    <section className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
                        <div className="flex gap-4 mb-6">
                            <button onClick={() => setActiveTab('snippet')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'snippet' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                                <Code2 size={18} /> Анализ Сниппета
                            </button>
                            <button onClick={() => setActiveTab('github')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'github' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                                <GitBranch size={18} /> Анализ GitHub
                            </button>
                            <button onClick={() => setActiveTab('file')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'file' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                                <FileUp size={18} /> Анализ Файла
                            </button>
                        </div>

                        <form onSubmit={handleAnalyze} className="flex flex-col gap-4">
                            {activeTab === 'snippet' && <textarea className="w-full h-48 bg-slate-950 border border-slate-700 rounded-xl p-4 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none resize-y" placeholder="// Вставьте исходный код сюда..." value={sourceCode} onChange={(e) => setSourceCode(e.target.value)} required />}
                            {activeTab === 'github' && <input type="url" className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://github.com/user/repository" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} required />}
                            {activeTab === 'file' && (
                                <div className="flex flex-col items-center justify-center w-full">
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" required />
                                    <button type="button" onClick={() => fileInputRef.current.click()} className="w-full flex flex-col items-center justify-center p-6 border-2 border-slate-600 border-dashed rounded-xl cursor-pointer hover:bg-slate-700/50">
                                        <FileUp className="h-10 w-10 text-slate-500 mb-2" />
                                        <span className="font-semibold text-slate-300">Нажмите, чтобы выбрать файл</span>
                                        <span className="text-xs text-slate-400">Язык будет определен автоматически</span>
                                    </button>
                                    {selectedFile && <div className="mt-4 flex items-center gap-2 text-slate-300"><Paperclip size={16} /><span>{selectedFile.name}</span></div>}
                                </div>
                            )}

                            <button disabled={loading} type="submit" className="self-end bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-50">
                                {loading ? <Loader2 className="animate-spin" /> : <Search />}
                                {loading ? 'Анализ нейросетью...' : 'Запустить скан'}
                            </button>
                        </form>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-white border-l-4 border-blue-500 pl-3">Результаты анализа</h2>
                        {renderResults()}
                    </section>
                </div>
            </div>
        );
}