import React, { createContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        user: JSON.parse(localStorage.getItem('user')) ?? null,
        jwtToken: localStorage.getItem('access_token') ?? null,
        loading: false, // If profile data is being fetched
        error: null, // Stores any errors during fetching
    });

    // Login function
    const loginUser = ({ userData, jwtToken }) => {
        setAuthState({
            user: userData,
            jwtToken: jwtToken,
            loading: false,
            error: null,
        });
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('access_token', jwtToken);
    };

    // Logout function
    const logoutUser = () => {
        setAuthState({
            user: null,
            jwtToken: null,
            loading: false,
            error: null,
        });
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
    };

    // Function to fetch user profile
    const fetchUserProfile = async (token) => {
        setAuthState((prevState) => ({ ...prevState, loading: true, error: null }));
        try {
            const response = await fetch('/api/get-profile', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    logoutUser();
                    toast.error('Session expired. Please log in again.');
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch profile.');
                }
            } else {
                const data = await response.json();
                setAuthState((prevState) => ({
                    ...prevState,
                    user: data.user,
                    loading: false,
                }));
                localStorage.setItem('user', JSON.stringify(data.user)); // Update localStorage with fresh data
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            setAuthState((prevState) => ({
                ...prevState,
                loading: false,
                error: error.message,
            }));
            toast.error(`Error fetching profile: ${error.message}`);
        }
    };

    // Fetch user profile on mount or when jwtToken changes
    useEffect(() => {
        const token = authState.jwtToken;
        if (token) {
            fetchUserProfile(token);
        }
    }, [authState.jwtToken]);

    return (
        <AuthContext.Provider value={{ ...authState, loginUser, logoutUser }}>
            {children}
        </AuthContext.Provider>
    );
};
