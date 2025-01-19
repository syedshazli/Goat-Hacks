import { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from './AuthContext';

export const CourseContext = createContext();

export const CourseProvider = ({ children }) => {
    const { user, jwtToken } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [errorCourses, setErrorCourses] = useState(null);

    // Normalize title
    const normalizeTitle = (title) => {
        return title.toLowerCase().trim();
    };

    // Filter out duplicate courses by course_title
    const filterDistinctCourses = (courseList) => {
        const seenTitles = new Set();
        return courseList.filter((course) => {
            const normalizedTitle = normalizeTitle(course.course_title || '');
            if (seenTitles.has(normalizedTitle)) {
                return false; // Skip duplicate
            }
            seenTitles.add(normalizedTitle);
            return true;
        });
    };

    // Fetch courses from backend
    const fetchCourses = () => {
        setLoadingCourses(true);
        fetch('/api/courses', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`,
            },
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch courses');
                }
                return response.json();
            })
            .then(data => {
                console.log("Fetched Courses:", data.courses);
                const distinctCourses = filterDistinctCourses(data.courses);
                setCourses(distinctCourses);
            })
            .catch(err => {
                console.error(err);
                setErrorCourses(err.message);
            })
            .finally(() => {
                setLoadingCourses(false);
            });
    };

    // Fetch data on mount or when user changes
    useEffect(() => {
        if (user) { // Only fetch if user is logged in
            fetchCourses();
        } else {
            // Reset state if user logs out
            setCourses([]);
            setLoadingCourses(false);
            setErrorCourses(null);
        }
    }, [user]);

    // Separate academic courses from sports courses using the correct property
    const academicCourses = useMemo(() => {
        return courses.filter((c) => {
            const title = normalizeTitle(c.course_title || '');
            const isAcademic = !title.includes("varsity") && !(title.includes("wpe") && title.includes("club"));
            if (isAcademic) console.log("Academic Course:", c.course_title);
            return isAcademic;
        });
    }, [courses]);

    const sportsCourses = useMemo(() => {
        return courses.filter((c) => {
            const title = normalizeTitle(c.course_title || '');
            const isSport = title.includes("varsity") || (title.includes("wpe") && title.includes("club"));
            if (isSport) console.log("Sport Course:", c.course_title);
            return isSport;
        });
    }, [courses]);

    return (
        <CourseContext.Provider
            value={{
                courses,
                academicCourses,
                sportsCourses,
                loadingCourses,
                errorCourses,
                fetchCourses,
            }}
        >
            {children}
        </CourseContext.Provider>
    );
};
