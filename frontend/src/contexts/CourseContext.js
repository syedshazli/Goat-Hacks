import { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const CourseContext = createContext();

export const CourseProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingSchedules, setLoadingSchedules] = useState(true);
    const [errorCourses, setErrorCourses] = useState(null);
    const [errorSchedules, setErrorSchedules] = useState(null);

    // Fetch courses from backend
    const fetchCourses = () => {
        setLoadingCourses(true);
        fetch('/courses', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${token}`,
            },
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch courses');
                }
                return response.json();
            })
            .then(data => {
                setCourses(data.courses);
            })
            .catch(err => {
                console.error(err);
                setErrorCourses(err.message);
            })
            .finally(() => {
                setLoadingCourses(false);
            });
    };

    // Fetch schedules from backend
    const fetchSchedules = () => {
        setLoadingSchedules(true);
        fetch('/schedules', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${token}`,
            },
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch schedules');
                }
                return response.json();
            })
            .then(data => {
                setSchedules(data.schedules);
            })
            .catch(err => {
                console.error(err);
                setErrorSchedules(err.message);
            })
            .finally(() => {
                setLoadingSchedules(false);
            });
    };

    // Fetch data on mount or when user changes
    useEffect(() => {
        if (user) { // Only fetch if user is logged in
            fetchCourses();
            fetchSchedules();
        } else {
            // Reset state if user logs out
            setCourses([]);
            setSchedules([]);
            setLoadingCourses(false);
            setLoadingSchedules(false);
            setErrorCourses(null);
            setErrorSchedules(null);
        }
    }, [user]);

    return (
        <CourseContext.Provider
            value={{
                courses,
                schedules,
                loadingCourses,
                loadingSchedules,
                errorCourses,
                errorSchedules,
                fetchCourses,
                fetchSchedules,
                setSchedules,
            }}
        >
            {children}
        </CourseContext.Provider>
    );
};
