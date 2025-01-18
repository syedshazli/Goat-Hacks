import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // fetch route

    // on mount check localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('myUser');
        if (storedUser) setUser(JSON.parse(storedUser));
    }, []);

    // Login function
    const loginUser = (userData) => {
        setUser(userData);
        localStorage.setItem('myUser', JSON.stringify(userData));
    };

    // Logout function
    const logoutUser = () => {
        setUser(null);
        localStorage.removeItem('myUser');
    };

    return (
        <AuthContext.Provider value={{ user, loginUser, logoutUser }}>
            {children}
        </AuthContext.Provider>
    );
};
