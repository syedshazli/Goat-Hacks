import { useContext, useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { AuthContext } from '../contexts/AuthContext';
import { CourseContext } from '../contexts/CourseContext';
import { toast } from 'react-toastify';
import debounce from 'lodash.debounce';

const AccountPage = () => {
    const { user, jwtToken, logoutUser } = useContext(AuthContext);
    const { academicCourses, sportsCourses, fetchCourses } = useContext(CourseContext);

    // Local states to allow editing
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [completedCourses, setCompletedCourses] = useState(user?.completedCourses || []);
    const [sports, setSports] = useState(user?.sports || []);
    const [futureGoals, setFutureGoals] = useState(user?.futureGoals || '');

    // States for search
    const [courseSearchTerm, setCourseSearchTerm] = useState('');
    const [courseResults, setCourseResults] = useState([]);
    const [isCourseLoading, setIsCourseLoading] = useState(false);
    const [courseError, setCourseError] = useState('');

    const [sportSearchTerm, setSportSearchTerm] = useState('');
    const [sportResults, setSportResults] = useState([]);
    const [isSportLoading, setIsSportLoading] = useState(false);
    const [sportError, setSportError] = useState('');

    // Debounced function to search courses using context data
    const debouncedSearchCourses = useCallback(
        debounce((query) => {
            if (!query) {
                setCourseResults([]);
                setCourseError('');
                setIsCourseLoading(false);
                return;
            }
            setIsCourseLoading(true);
            setCourseError('');
            try {
                const normalizedQuery = query.toLowerCase().trim();
                const results = academicCourses.filter((course) =>
                    course.course_title.toLowerCase().includes(normalizedQuery)
                );
                if (results.length > 0) {
                    setCourseResults(results);
                } else {
                    setCourseError('No matching courses found.');
                    setCourseResults([]);
                }
            } catch (error) {
                console.error('Error searching courses:', error);
                setCourseError('An error occurred while searching for courses.');
                setCourseResults([]);
            } finally {
                setIsCourseLoading(false);
            }
        }, 500),
        [academicCourses]
    );

    // Effect to handle course search
    useEffect(() => {
        debouncedSearchCourses(courseSearchTerm);
        // Cleanup on unmount
        return debouncedSearchCourses.cancel;
    }, [courseSearchTerm, debouncedSearchCourses]);

    // Debounced function to search sports/clubs using sportsCourses from context
    const debouncedSearchSports = useCallback(
        debounce((query) => {
            if (!query) {
                setSportResults([]);
                setSportError('');
                setIsSportLoading(false);
                return;
            }
            setIsSportLoading(true);
            setSportError('');
            try {
                const normalizedQuery = query.toLowerCase().trim();
                const results = sportsCourses.filter((sport) =>
                    sport.course_title.toLowerCase().includes(normalizedQuery)
                );
                if (results.length === 0) {
                    setSportError('No matching sports/clubs found.');
                }
                setSportResults(results);
            } catch (error) {
                console.error('Error searching sports/clubs:', error);
                setSportError('An error occurred while searching for sports/clubs.');
                setSportResults([]);
            } finally {
                setIsSportLoading(false);
            }
        }, 300),
        [sportsCourses]
    );

    // Effect to handle sports search
    useEffect(() => {
        debouncedSearchSports(sportSearchTerm);
        // Cleanup on unmount
        return debouncedSearchSports.cancel;
    }, [sportSearchTerm, debouncedSearchSports]);

    // Save Profile Function
    const handleSaveProfile = () => {
        const updatedData = {
            name,
            email,
            completedCourses,
            sports,
            futureGoals,
        };

        // Send updated data to the server
        fetch('/api/update-account', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwtToken}`,
            },
            body: JSON.stringify(updatedData),
        })
        .then(async (res) => {
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.message || 'Profile failed to update.');
                throw new Error(data.message || 'Update failed');
            }
            toast.success('Profile updated successfully.');
            setEditing(false);
        })
        .catch((err) => {
            console.error(err);
            toast.error('An error occurred while updating your profile.');
        });
    };

    // Handlers to add a course
    const handleAddCourse = (courseTitle) => {
        if (completedCourses.includes(courseTitle)) {
            toast.info('Course already added.');
            return;
        }
        setCompletedCourses([...completedCourses, courseTitle]);
        setCourseSearchTerm('');
        setCourseResults([]);
    };

    // Handlers to add a sport/club
    const handleAddSport = (sportName) => {
        if (sports.includes(sportName)) {
            toast.info('Sport/Club already added.');
            return;
        }
        setSports([...sports, sportName]);
        setSportSearchTerm('');
        setSportResults([]);
    };

    // Handle removing a course
    const handleRemoveCourse = (courseTitle) => {
        setCompletedCourses(completedCourses.filter((c) => c !== courseTitle));
    };

    // Handle removing a sport/club
    const handleRemoveSport = (sportName) => {
        setSports(sports.filter((s) => s !== sportName));
    };

    // Fetch courses on mount if not already fetched
    useEffect(() => {
        if (user && academicCourses.length === 0 && sportsCourses.length === 0) {
            fetchCourses();
        }
    }, [user, academicCourses, sportsCourses, fetchCourses]);

    return (
        <div className="min-h-screen bg-[#AC2B37] text-white">
            <Navbar />
            <div className="max-w-5xl mx-auto py-24 px-4">

                {/* Glass Container */}
                <div className="glass p-6 sm:p-8 rounded-2xl shadow-xl mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-3xl font-bold">My Account</h2>
                        {!editing && (
                            <button
                                onClick={() => setEditing(true)}
                                className="button-default"
                            >
                                Edit
                            </button>
                        )}
                    </div>

                    {editing ? (
                        <div className="space-y-4">

                            {/* Name */}
                            <div>
                                <label className="block mb-1 font-semibold">Name</label>
                                <input
                                    className="w-full p-2 rounded text-black"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block mb-1 font-semibold">Email</label>
                                <input
                                    type="email"
                                    className="w-full p-2 rounded text-black"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            {/* Future Goals */}
                            <div>
                                <label className="block mb-1 font-semibold">Future Goals</label>
                                <textarea
                                    rows="3"
                                    className="w-full p-2 rounded text-black"
                                    value={futureGoals}
                                    onChange={(e) => setFutureGoals(e.target.value)}
                                />
                            </div>

                            {/* Completed Courses */}
                            <div>
                                <label className="block mb-1 font-semibold">Completed Courses</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {completedCourses.map((course, idx) => (
                                        <span
                                            key={idx}
                                            className="bg-white/30 px-2 py-1 rounded-full text-sm flex items-center space-x-2"
                                        >
                                            <span>{course}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveCourse(course)}
                                                className="hover:text-red-300"
                                            >
                                                &times;
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                {/* Search and Add Course */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search and add course"
                                        className="w-full p-2 rounded text-black"
                                        value={courseSearchTerm}
                                        onChange={(e) => setCourseSearchTerm(e.target.value)}
                                    />
                                    {/* Loading Indicator */}
                                    {isCourseLoading && (
                                        <div className="absolute right-3 top-2">
                                            <span>Loading...</span>
                                        </div>
                                    )}
                                    {/* Error Message */}
                                    {courseError && (
                                        <div className="text-red-300 text-sm mt-1">
                                            {courseError}
                                        </div>
                                    )}
                                    {/* Search Results */}
                                    {courseResults.length > 0 && (
                                        <ul className="absolute z-10 bg-white text-black w-full mt-1 max-h-60 overflow-y-auto rounded shadow-lg">
                                            {courseResults.map((course) => (
                                                <li
                                                    key={course.id}
                                                    className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                                                    onClick={() => handleAddCourse(course.course_title)}
                                                >
                                                    {course.course_title} ({course.course_section})
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>

                            {/* Sports / Clubs */}
                            <div>
                                <label className="block mb-1 font-semibold">Sports / Clubs</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {sports.map((sport, idx) => (
                                        <span
                                            key={idx}
                                            className="bg-white/30 px-2 py-1 rounded-full text-sm flex items-center space-x-2"
                                        >
                                            <span>{sport}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveSport(sport)}
                                                className="hover:text-red-300"
                                            >
                                                &times;
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                {/* Search and Add Sport/Club */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search and add sport/club"
                                        className="w-full p-2 rounded text-black"
                                        value={sportSearchTerm}
                                        onChange={(e) => setSportSearchTerm(e.target.value)}
                                    />
                                    {/* Loading Indicator */}
                                    {isSportLoading && (
                                        <div className="absolute right-3 top-2">
                                            <span>Loading...</span>
                                        </div>
                                    )}
                                    {/* Error Message */}
                                    {sportError && (
                                        <div className="text-red-300 text-sm mt-1">
                                            {sportError}
                                        </div>
                                    )}
                                    {/* Search Results */}
                                    {sportResults.length > 0 && (
                                        <ul className="absolute z-10 bg-white text-black w-full mt-1 max-h-40 overflow-y-auto rounded shadow-lg">
                                            {sportResults.map((sport, idx) => (
                                                <li
                                                    key={idx}
                                                    className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                                                    onClick={() => handleAddSport(sport.course_title)}
                                                >
                                                    {sport.course_title} ({sport.course_section})
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>

                            {/* Save and Cancel Buttons */}
                            <div className="mt-4 flex gap-2">
                                <button onClick={handleSaveProfile} className="button-default">
                                    Save
                                </button>
                                <button onClick={() => setEditing(false)} className="button-default text-black active:bg-gray-200">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        // Display mode
                        <div className="space-y-3">
                            <p><b>Name:</b> {name}</p>
                            <p><b>Email:</b> {email}</p>
                            <p><b>Future Goals:</b> {futureGoals || 'None'}</p>
                            <p>
                                <b>Completed Courses:</b>{' '}
                                {completedCourses.length > 0 ? completedCourses.join(', ') : 'None'}
                            </p>
                            <p>
                                <b>Sports / Clubs:</b>{' '}
                                {sports.length > 0 ? sports.join(', ') : 'None'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Logout Button */}
                <div className="text-center">
                    <button onClick={logoutUser} className="button-default">
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AccountPage;
