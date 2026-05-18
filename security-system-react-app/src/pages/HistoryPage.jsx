import React, { useState, useEffect } from 'react';
import { History, Loader2, Code, Calendar, Terminal, ArrowLeft, ExternalLink, ShieldAlert } from 'lucide-react';
import axiosInstance, { SCANNER_API_URL } from '../api/axiosConfig';
import VulnerabilityDetails from '../components/VulnerabilityDetails';

export default function HistoryPage() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedScan, setSelectedScan] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axiosInstance.get(`${SCANNER_API_URL}/history`);
                setHistory(res.data);
            } catch (err) {
                console.error("Ошибка загрузки истории:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const handleSelectScan = (scan) => {
        try {
            console.log(scan)
            const findings = JSON.parse(scan.findingsJson || '[]');
            setSelectedScan({ ...scan, findings });
            // Прокрутка вверх при открытии деталей
            window.scrollTo(0, 0);
        } catch (e) {
            alert("Ошибка при чтении данных сканирования");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <Loader2 className="animate-spin text-blue-500" size={48} />
                <p className="text-slate-400">Загрузка истории сканирований...</p>
            </div>
        );
    }

    // Если выбран конкретный скан — показываем его детали
    if (selectedScan) {
        return (
            <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setSelectedScan(null)}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        Назад к списку
                    </button>
                    <div className="text-right">
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Дата сканирования</p>
                        <p className="text-slate-300">{new Date(selectedScan.createdAt).toLocaleString()}</p>
                    </div>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-blue-600/20 p-3 rounded-xl text-blue-400">
                            <Terminal size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{selectedScan.inputSource}</h2>
                            <p className="text-slate-400">Язык: <span className="text-blue-400">{selectedScan.language}</span></p>
                        </div>
                    </div>

                    <div className="mt-4">
                        <p className="text-sm text-slate-500 mb-2">Анализируемый код / Контент:</p>
                        <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-slate-400 border border-slate-700 max-h-40 overflow-y-auto">
                            {selectedScan.inputContent}
                        </pre>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-2 text-xl font-bold text-white px-2">
                        <ShieldAlert className="text-red-500" />
                        Найдено уязвимостей: {selectedScan.findings.length}
                    </div>

                    {selectedScan.findings.length > 0 ? (
                        selectedScan.findings.map((v, index) => (
                            <VulnerabilityDetails key={index} vuln={v} />
                        ))
                    ) : (
                        <div className="bg-slate-800 p-10 rounded-2xl text-center border border-slate-700">
                            <p className="text-slate-400">В этом сканировании уязвимостей не обнаружено.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // По умолчанию показываем список всей истории
    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-2 rounded-lg text-white">
                    <History size={28} />
                </div>
                <h1 className="text-3xl font-bold text-white">История анализов</h1>
            </div>

            {history.length === 0 ? (
                <div className="bg-slate-800 border-2 border-dashed border-slate-700 p-20 rounded-2xl text-center">
                    <p className="text-slate-500 text-lg">Вы еще не проводили ни одного сканирования.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {history.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => handleSelectScan(item)}
                            className="group bg-slate-800 border border-slate-700 p-5 rounded-2xl hover:border-blue-500 hover:bg-slate-750 transition-all cursor-pointer shadow-sm hover:shadow-blue-500/10 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-5">
                                <div className="bg-slate-900 p-3 rounded-xl text-blue-400 group-hover:scale-110 transition-transform">
                                    <Terminal size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg group-hover:text-blue-400 transition-colors">
                                        {item.inputSource}
                                    </h3>
                                    <div className="flex gap-4 text-sm text-slate-400 mt-1">
                                        <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(item.createdAt).toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1.5"><Code size={14} /> {item.language}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-tighter">Найдено</p>
                                    <p className="text-white font-mono">
                                        {JSON.parse(item.findingsJson || '[]').length}
                                    </p>
                                </div>
                                <ExternalLink size={20} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}