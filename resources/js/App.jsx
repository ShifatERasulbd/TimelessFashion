import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';

import Header from './frontend/components/Header.jsx';
import Footer from './frontend/components/Footer.jsx';
import HomePage from './frontend/pages/HomePage.jsx';
import ShopPage from './frontend/pages/ShopPage.jsx';

function FrontendLayout() {
    return (
        <div className="min-h-screen bg-white text-zinc-950">
            <Header />
            <main>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<FrontendLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="shop" element={<ShopPage />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

const rootElement = document.getElementById('app');

if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        React.createElement(
            React.StrictMode,
            null,
            React.createElement(AppRouter)
        )
    );
}