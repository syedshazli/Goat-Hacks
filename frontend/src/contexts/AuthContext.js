import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        user: null,
        jwtToken: null,
    });

    // Login function
    const loginUser = ({ userData, jwtToken }) => {
        setAuthState({
            user: userData,
            jwtToken: jwtToken,
        });
        localStorage.setItem('access_token', jwtToken);
    };

    // Logout function
    const logoutUser = () => {
        setAuthState({
            user: null,
            jwtToken: null,
        });
        localStorage.removeItem('access_token');
    };

    return (
        <AuthContext.Provider value={{ ...authState, loginUser, logoutUser }}>
            {children}
        </AuthContext.Provider>
    );
};
