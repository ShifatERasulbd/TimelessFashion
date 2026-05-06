import React, { Suspense, lazy } from 'react'
import { LoginForm } from '@/components/login-form';
import { Toaster } from '@/components/ui/sonner';
import { AppProvider } from '@/context/AppContext';
import AppLayout from '@/layouts/AppLayout';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

function lazyWithRetry(importer, key) {
    return lazy(async () => {
        const storageKey = `lazy-retry:${key}`;

        try {
            const module = await importer();
            sessionStorage.removeItem(storageKey);
            return module;
        } catch (error) {
            const hasRetried = sessionStorage.getItem(storageKey) === '1';

            if (!hasRetried && error instanceof TypeError) {
                sessionStorage.setItem(storageKey, '1');
                window.location.reload();
                return new Promise(() => {});
            }

            sessionStorage.removeItem(storageKey);
            throw error;
        }
    });
}

const Dashboard = lazyWithRetry(() => import('@/pages/dashboard'), 'dashboard');
const Users     = lazyWithRetry(() => import('@/pages/User/user'), 'users');
const AddUser   = lazyWithRetry(() => import('@/pages/User/addUser'), 'add-user');
const EditUser  = lazyWithRetry(() => import('@/pages/User/editUser'), 'edit-user');


export default function App() {
    return (
        <AppProvider>
            <BrowserRouter>
                <Suspense fallback={<div className="text-center p-10">Loading...</div>}>
                    <Routes>
                        <Route
                            path="/admin"
                            element={
                                <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
                                    <LoginForm />
                                </main>
                            }
                        />

                        <Route path="/admin" element={<AppLayout />}>
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="users" element={<Users />} />
                            <Route path="users/add" element={<AddUser />} />
                            <Route path="users/:id/edit" element={<EditUser />} />
                        </Route>

                        <Route path="/" element={<main />} />
                    </Routes>
                </Suspense>
            </BrowserRouter>
            <Toaster position="top-right" richColors />
        </AppProvider>
    );
}