import React, { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authHeader, setAuthHeader] = useState('');
    const [userRole, setUserRole] = useState('');
    const navigate = useNavigate();

    const login = async (username, password) => {
        try {
            const basicAuth = btoa(`${username}:${password}`);
            console.log(window.location.origin);
            const response = await fetch(`${window.location.protocol}//${window.location.hostname}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${basicAuth}`
                },
                credentials: "include",
                body: JSON.stringify({username, password})
            });

            if (response.ok) {
                const encodedAuthString = btoa(`${username}:${password}`);
                setAuthHeader(`Basic ${encodedAuthString}`);
                setIsAuthenticated(true);
                const roles = await response.json();
                setUserRole(roles[0]);
                navigate('/main')
            } else if (response.status === 401) {
                console.error('Authentication failed');
                setIsAuthenticated(false)
                alert("Incorrect credentials");
            } else {
                console.error('Authentication failed with status:', response.status);
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error('Error during login:', error);
            setIsAuthenticated(false)
        }
    };

    const logout = () => {
        setIsAuthenticated(false);
        setAuthHeader("")
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, authHeader, userRole }}>
            {children}
        </AuthContext.Provider>
    );
};
