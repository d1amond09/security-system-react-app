import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ConfirmEmail from './pages/ConfirmEmail';
import ScannerPage from './pages/ScannerPage';
import BlockedPage from './pages/BlockedPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminUsersPage from './pages/AdminUsersPage';
import ProfilePage from './pages/ProfilePage';
import Header from './components/Header';
import AdminSettingsPage from './pages/AdminSettingsPage';
import HistoryPage from './pages/HistoryPage';

const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    if (user.status === 'Blocked') return <Navigate to="/blocked" replace />;

    return (
        <div className="min-h-screen flex flex-col">
            <Header /> 
            <main className="flex-grow">
                {children}
            </main>
        </div>
    );
};
const AdminRoute = ({ children }) => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;

    const roleKey = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
    const roles = user[roleKey] || user.role || [];
    const isAdmin = Array.isArray(roles) ? roles.includes('Admin') : roles === 'Admin';

    return isAdmin ? <ProtectedRoute>{children}</ProtectedRoute> : <Navigate to="/" replace />;
};

const GOOGLE_CLIENT_ID = "730563147431-2obpt5h75t08rvtv90vu1hp72o3tn1da.apps.googleusercontent.com";

export default function App() {
    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/register" element={<Register />} />
                        <Route path="/confirm-email" element={<ConfirmEmail />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/blocked" element={<BlockedPage />} />

                        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                        <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
                        <Route path="/" element={<ProtectedRoute><ScannerPage /></ProtectedRoute>} />
                        <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
                        <Route path="/admin/settings" element={<AdminRoute><AdminSettingsPage /></AdminRoute>} />

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </GoogleOAuthProvider>
    );
}