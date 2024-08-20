import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import LoginPage from './loginPage';
import HomePage from './homePage';
import {AuthProvider} from "./authContext";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Router>
        <AuthProvider>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/main" element={<HomePage />} />
                <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
        </AuthProvider>
    </Router>
);


