import React, { Suspense, lazy } from 'react'
import { LoginForm } from '@/components/login-form';
import { Toaster } from '@/components/ui/sonner';
import { AppProvider } from '@/context/AppContext';
import AppLayout from '@/layouts/AppLayout';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

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
// User Management
const Users     = lazyWithRetry(() => import('@/pages/User/user'), 'users');
const AddUser   = lazyWithRetry(() => import('@/pages/User/addUser'), 'add-user');
const EditUser  = lazyWithRetry(() => import('@/pages/User/editUser'), 'edit-user');
// Hero Management
const Heroes    = lazyWithRetry(() => import('@/pages/Hero/hero'), 'hero');
const AddHero   = lazyWithRetry(() => import('@/pages/Hero/addHero'), 'add-hero');
const EditHero  = lazyWithRetry(() => import('@/pages/Hero/editHero'), 'edit-hero');

const PersonalizerFeatures = lazyWithRetry(() => import('../personalizer/features'), 'personalizer-features');
const PersonalizerConfirmOrder = lazyWithRetry(() => import('../personalizer/confirm-order'), 'personalizer-confirm-order');
const PersonalizationOrders = lazyWithRetry(() => import('@/pages/Personalization/orders'), 'personalization-orders');
const ViewPersonalizationOrder = lazyWithRetry(() => import('@/pages/Personalization/viewOrder'), 'personalization-order-view');
const EditPersonalizationOrder = lazyWithRetry(() => import('@/pages/Personalization/editOrder'), 'personalization-order-edit');



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
                        {/* user Managemnent */}
                        <Route path="/admin" element={<AppLayout />}>
                            <Route path="dashboard" element={<Dashboard />} />
                            {/* user  */}
                            <Route path="users" element={<Users />} />
                            <Route path="users/add" element={<AddUser />} />
                            <Route path="users/:id/edit" element={<EditUser />} />
                            {/* Hero  */}
                            <Route path="hero" element={<Heroes />} />
                            <Route path="hero/add" element={<AddHero />} />
                            <Route path="hero/:id/edit" element={<EditHero />} />

                            {/* Personalization Orders */}
                            <Route path="personalization/orders" element={<PersonalizationOrders />} />
                            <Route path="personalization/orders/:id" element={<ViewPersonalizationOrder />} />
                            <Route path="personalization/orders/:id/edit" element={<EditPersonalizationOrder />} />

                        </Route>

                        <Route path="/personalizer/features" element={<PersonalizerFeatures />} />
                        <Route path="/personalizer/confirm-order" element={<PersonalizerConfirmOrder />} />
                        <Route path="/admin/features" element={<Navigate to="/personalizer/features" replace />} />

                        <Route path="/" element={<main />} />

                        {/* Hero Management */}
                       
                    </Routes>
                </Suspense>
            </BrowserRouter>
            <Toaster position="top-right" richColors />
        </AppProvider>
    );
}