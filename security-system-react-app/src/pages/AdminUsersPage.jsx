import React, { useState, useEffect, useMemo } from 'react';
import { Check, Users, Trash2, KeyRound, ShieldBan, ShieldCheck, User, X, Loader2, Terminal, Filter, Search, ArrowUpDown, Plus, History } from 'lucide-react';
import axiosInstance, { USER_API_URL, SCANNER_API_URL } from '../api/axiosConfig';
import Pagination from '../components/Pagination'; 
import VulnerabilityDetails from '../components/VulnerabilityDetails';
import debounce from 'lodash.debounce';

const initialParams = {
    PageNumber: 1,
    PageSize: 10,
    OrderBy: 'UserName',
    SearchTerm: '',
    IsBlocked: null,
    Role: '',
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [metaData, setMetaData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedUsers, setSelectedUsers] = useState(new Set());
    const [queryParams, setQueryParams] = useState(initialParams);
    const [editingRolesForUser, setEditingRolesForUser] = useState(null); 
    const [newRole, setNewRole] = useState('User');
    const [viewingHistoryUser, setViewingHistoryUser] = useState(null);
    const [userHistory, setUserHistory] = useState([]);
    const [selectedScan, setSelectedScan] = useState(null); 
    const [historyLoading, setHistoryLoading] = useState(false);

    const fetchUsers = async (params) => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(`${USER_API_URL}/users`, { params });
            setUsers(res.data);
            const paginationData = JSON.parse(res.headers['x-pagination']);
            setMetaData(paginationData);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    const debouncedFetch = useMemo(() => debounce(fetchUsers, 500), []);

    useEffect(() => {
        debouncedFetch(queryParams);
        return () => debouncedFetch.cancel();
    }, [queryParams, debouncedFetch]);

    const handleSearch = (e) => {
        const newParams = { ...queryParams, SearchTerm: e.target.value, PageNumber: 1 };
        setQueryParams(newParams);
    };

    const handleRoleFilterChange = (role) => {
        const newParams = { ...queryParams, Role: role, PageNumber: 1 };
        setQueryParams(newParams);
    };

    const handleFilterChange = (isBlocked) => {
        const newParams = { ...queryParams, IsBlocked: isBlocked, PageNumber: 1 };
        setQueryParams(newParams);
    };

    const handleSort = (field) => {
        const isDesc = queryParams.OrderBy.startsWith(field) && !queryParams.OrderBy.endsWith(' desc');
        const newOrderBy = `${field}${isDesc ? ' desc' : ''}`;
        setQueryParams({ ...queryParams, OrderBy: newOrderBy });
    };

    const handlePageChange = (page) => {
        setQueryParams({ ...queryParams, PageNumber: page });
    };

    const handleSelectUser = (userId) => {
        const newSelection = new Set(selectedUsers);
        if (newSelection.has(userId)) {
            newSelection.delete(userId);
        } else {
            newSelection.add(userId);
        }
        setSelectedUsers(newSelection);
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedUsers(new Set(users.map(u => u.id)));
        } else {
            setSelectedUsers(new Set());
        }
    };

    const handleMassDelete = async () => {
        if (selectedUsers.size === 0 || !window.confirm(`Удалить ${selectedUsers.size} пользователей?`)) return;
        try {
            await Promise.all(
                Array.from(selectedUsers).map(id => axiosInstance.delete(`${USER_API_URL}/users/${id}`))
            );
            setSelectedUsers(new Set());
            fetchUsers(queryParams);
        } catch (error) {
            alert('Ошибка при массовом удалении.');
        }
    };

    const handleMassAction = async (action) => {
        if (selectedUsers.size === 0) return;
        try {
            await Promise.all(
                Array.from(selectedUsers).map(id =>
                    axiosInstance.patch(`${USER_API_URL}/users/${id}/status`, { action })
                )
            );
            setSelectedUsers(new Set());
            fetchUsers(queryParams);
        } catch (error) {
            alert(`Ошибка при массовом действии: ${action}`);
        }
    };

    const handleAddRole = async () => {
        if (!editingRolesForUser || !newRole) return;
        try {
            await axiosInstance.post(`${USER_API_URL}/users/${editingRolesForUser.id}/roles`, { roleName: newRole });
            setEditingRolesForUser(prev => ({ ...prev, roles: [...prev.roles, newRole] }));
            fetchUsers(queryParams);
        } catch (error) {
            alert('Ошибка добавления роли. Возможно, она уже есть у пользователя.');
        }
    };

    const handleRemoveRole = async (roleName) => {
        if (!editingRolesForUser || !window.confirm(`Удалить роль "${roleName}"?`)) return;
        try {
            await axiosInstance.delete(`${USER_API_URL}/users/${editingRolesForUser.id}/roles/${roleName}`);
            setEditingRolesForUser(prev => ({ ...prev, roles: prev.roles.filter(r => r !== roleName) }));
            fetchUsers(queryParams);
        } catch (error) {
            alert('Ошибка удаления роли.');
        }
    };

    const handleViewHistory = async (user) => {
        setViewingHistoryUser(user);
        setHistoryLoading(true);
        setSelectedScan(null);
        try {
            const res = await axiosInstance.get(`${SCANNER_API_URL}/history/user/${user.id}`);
            setUserHistory(res.data);
        } catch (error) {
            alert(error);
            alert("Не удалось загрузить историю пользователя");
        } finally {
            setHistoryLoading(false);
        }
    };

    const SortableHeader = ({ field, children }) => (
        <button onClick={() => handleSort(field)} className="flex items-center gap-1 font-medium hover:text-white">
            {children}
            {queryParams.OrderBy.startsWith(field) && <ArrowUpDown size={14} />}
        </button>
    );

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <header>
                    <h1 className="text-3xl font-extrabold text-white">Управление пользователями</h1>
                </header>

                <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700">
                    {/* Панель управления (фильтры и действия) */}
                    <div className="p-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-700">
                        <div className="flex items-center gap-2">
                            <Search size={16} className="text-slate-500" />
                            <input
                                type="text"
                                placeholder="Поиск по имени, email..."
                                onChange={handleSearch}
                                className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter size={16} className="text-slate-500" />
                            <select onChange={e => handleFilterChange(e.target.value === 'null' ? null : e.target.value === 'true')} className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm outline-none">
                                <option value="null">Все статусы</option>
                                <option value="false">Активные</option>
                                <option value="true">Заблокированные</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <Users size={16} className="text-slate-500" />
                            <select
                                value={queryParams.Role}
                                onChange={e => handleRoleFilterChange(e.target.value)}
                                className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 text-slate-300"
                            >
                                <option value="">Все роли</option>
                                <option value="Admin">Admin</option>
                                <option value="User">User</option>
                            </select>
                        </div>

                        {/* Кнопки массовых действий */}
                        <div className="flex items-center gap-2">
                            <button onClick={() => handleMassAction('Block')} disabled={selectedUsers.size === 0} className="px-3 py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                <ShieldBan size={16} /> Заблокировать
                            </button>
                            <button onClick={() => handleMassAction('Unblock')} disabled={selectedUsers.size === 0} className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                <ShieldCheck size={16} /> Разблокировать
                            </button>
                            <button onClick={handleMassDelete} disabled={selectedUsers.size === 0} className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                <Trash2 size={16} /> Удалить
                            </button>
                        </div>
                    </div>

                    {/* Таблица */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-950/50 text-slate-400">
                                <tr>
                                    <th className="p-4 w-12">
                                        <label className="relative flex items-center justify-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                onChange={handleSelectAll}
                                                checked={selectedUsers.size === users.length && users.length > 0}
                                            />
                                            <div className="w-5 h-5 border-2 border-slate-600 rounded bg-slate-900 peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-hover:border-blue-400 transition-all flex items-center justify-center">
                                                <Check size={14} className="text-white scale-0 peer-checked:scale-100 transition-transform duration-200" strokeWidth={4} />
                                            </div>
                                        </label>
                                    </th>
                                    <th className="p-4 w-16">Фото</th> 
                                    <th className="p-4"><SortableHeader field="UserName">Username</SortableHeader></th>
                                    <th className="p-4"><SortableHeader field="Email">Email</SortableHeader></th>
                                    <th className="p-4"><SortableHeader field="FirstName">Имя Фамилия</SortableHeader></th>
                                    <th className="p-4">Статус</th>
                                    <th className="p-4">Роли</th>
                                    <th className="p-4">Действия</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {loading ? (
                                    <tr><td colSpan="5" className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" /></td></tr>
                                ) : users.map(user => (
                                    <tr key={user.id} className={`${selectedUsers.has(user.id) ? 'bg-blue-900/50' : ''} hover:bg-slate-750 transition-colors`}>
                                        <td className="p-4">
                                            <label className="relative flex items-center justify-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={selectedUsers.has(user.id)}
                                                    onChange={() => handleSelectUser(user.id)}
                                                />
                                                <div className="w-5 h-5 border-2 border-slate-600 rounded bg-slate-900 peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-hover:border-blue-500 transition-all flex items-center justify-center">
                                                    <Check size={14} className="text-white scale-0 peer-checked:scale-100 transition-transform duration-200" strokeWidth={4} />
                                                </div>
                                            </label>
                                        </td>
                                        <td className="p-4">
                                            <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-700 bg-slate-900 flex items-center justify-center">
                                                {(user.pictureUrl || user.PictureUrl) ? (
                                                    <img
                                                        src={user.pictureUrl || user.PictureUrl}
                                                        alt="Avatar"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <User size={18} className="text-slate-600" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 font-medium text-white">{user.userName}</td>
                                        <td className="p-4 text-slate-400">{user.email}</td>
                                        <td className="p-4 text-slate-400">{user.firstName} {user.lastName}</td>
                                        <td className="p-4">
                                            {user.isBlocked ? (
                                                <span className="inline-flex items-center gap-1 bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-bold">
                                                    <ShieldBan size={14} /> Заблокирован
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-bold">
                                                    <ShieldCheck size={14} /> Активен
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-1">
                                                {user.roles?.map(role => (
                                                    <span key={role} className={`px-2 py-1 text-xs font-bold rounded-full ${role === 'Admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-700 text-slate-300'}`}>
                                                        {role}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-4 flex justify-start gap-2">
                                            <button
                                                onClick={() => setEditingRolesForUser(user)}
                                                className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg"
                                                title="Управлять ролями">
                                                <KeyRound size={18} />
                                            </button>

                                            <button
                                                onClick={() => handleViewHistory(user)}
                                                className="p-2 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 rounded-lg"
                                                title="История сканирований"
                                            >
                                                <History size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Пагинация */}
                    <Pagination metaData={metaData} onPageChange={handlePageChange} />
                </div>

                {/* Модальное окно управления ролями */}
                {editingRolesForUser && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-700 shadow-2xl">
                            <div className="flex justify-between items-center p-6 border-b border-slate-700">
                                <h3 className="text-xl font-bold text-white">Роли: {editingRolesForUser.userName}</h3>
                                <button onClick={() => setEditingRolesForUser(null)} className="text-slate-400 hover:text-white"><X /></button>
                            </div>
                            <div className="p-6">
                                <div className="mb-4">
                                    <label className="block text-sm text-slate-400 mb-2">Текущие роли</label>
                                    <div className="flex flex-wrap gap-2">
                                        {editingRolesForUser.roles?.length > 0 ? editingRolesForUser.roles.map(role => (
                                            <div key={role} className="flex items-center gap-2 bg-slate-700 rounded-full pl-3 pr-1 py-1">
                                                <span className="text-sm font-medium">{role}</span>
                                                <button onClick={() => handleRemoveRole(role)} className="bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-full p-1"><X size={14} /></button>
                                            </div>
                                        )) : <span className="text-slate-500 italic text-sm">Нет ролей</span>}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-2">Добавить роль</label>
                                    <div className="flex gap-2">
                                        <select value={newRole} onChange={e => setNewRole(e.target.value)} className="flex-grow bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-blue-500">
                                            <option value="User">User</option>
                                            <option value="Admin">Admin</option>
                                            {/* Добавьте другие роли, если они есть */}
                                        </select>
                                        <button onClick={handleAddRole} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2"><Plus size={16} /> Добавить</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Модальное окно истории пользователя */}
                {viewingHistoryUser && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 rounded-2xl w-full max-w-5xl max-h-[90vh] border border-slate-700 shadow-2xl flex flex-col">
                        <div className="flex justify-between items-center p-6 border-b border-slate-700">
                            <div className="flex items-center gap-3">
                                <History className="text-purple-400" />
                                <div>
                                    <h3 className="text-xl font-bold text-white">История: {viewingHistoryUser.userName}</h3>
                                    <p className="text-xs text-slate-500">{viewingHistoryUser.email}</p>
                                </div>
                            </div>
                            <button onClick={() => setViewingHistoryUser(null)} className="text-slate-400 hover:text-white"><X /></button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-grow">
                            {historyLoading ? (
                                <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-500" size={48} /></div>
                            ) : selectedScan ? (
                                /* Просмотр конкретного скана */
                                <div className="space-y-6">
                                    <button onClick={() => setSelectedScan(null)} className="text-blue-400 text-sm mb-4 flex items-center gap-2">
                                        ← Назад к списку сканов
                                    </button>
                                    <div className="bg-slate-800 p-4 rounded-xl mb-6 border border-slate-700">
                                        <p className="text-sm text-slate-400 mb-2">Источник: {selectedScan.inputSource}</p>
                                        <pre className="text-xs font-mono bg-slate-950 p-3 rounded-lg text-slate-500 max-h-32 overflow-auto">
                                            {selectedScan.inputContent}
                                        </pre>
                                    </div>
                                    {JSON.parse(selectedScan.findingsJson || '[]').map((v, idx) => (
                                        <VulnerabilityDetails key={idx} vuln={v} />
                                    ))}
                                </div>
                            ) : userHistory.length > 0 ? (
                                /* Список всех сканов пользователя */
                                <div className="grid gap-3">
                                    {userHistory.map((scan) => (
                                        <div
                                            key={scan.id}
                                            onClick={() => setSelectedScan({ ...scan, findings: JSON.parse(scan.findingsJson || '[]') })}
                                            className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-purple-500 cursor-pointer transition-all flex justify-between items-center"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="bg-slate-950 p-2 rounded-lg text-slate-400"><Terminal size={18} /></div>
                                                <div>
                                                    <p className="text-white font-medium">{scan.inputSource}</p>
                                                    <p className="text-xs text-slate-500">{new Date(scan.createdAt).toLocaleString()} • {scan.language}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full text-xs font-bold">
                                                    Найдено: {JSON.parse(scan.findingsJson || '[]').length}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 text-slate-500">У этого пользователя еще нет истории сканирований.</div>
                            )}
                        </div>
                    </div>
                </div>
                )}
            </div>
        </div>
    );
}