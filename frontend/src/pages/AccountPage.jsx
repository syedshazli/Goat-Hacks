import { useContext, useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { AuthContext } from '../contexts/AuthContext';
import { CourseContext } from '../contexts/CourseContext';
import { toast } from 'react-toastify';

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

    const [sportSearchTerm, setSportSearchTerm] = useState('');
    const [sportResults, setSportResults] = useState([]);

    // Function to search courses based on input
    useEffect(() => {
        if (!courseSearchTerm) {
            setCourseResults([]);
        } else {
            const normalizedQuery = courseSearchTerm.toLowerCase().trim();
            const results = academicCourses.filter((course) =>
                course.course_title.toLowerCase().includes(normalizedQuery)
            );
            setCourseResults(results);
        }
    }, [courseSearchTerm, academicCourses]);

    // Function to search sports based on input
    useEffect(() => {
        if (!sportSearchTerm) {
            setSportResults([]);
        } else {
            const normalizedQuery = sportSearchTerm.toLowerCase().trim();
            const results = sportsCourses.filter((sport) =>
                sport.course_title.toLowerCase().includes(normalizedQuery)
            );
            setSportResults(results);
        }
    }, [sportSearchTerm, sportsCourses]);

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
                            <div>
                                <label className="block mb-1 font-semibold">Name</label>
                                <input
                                    className="w-full p-2 rounded text-black"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block mb-1 font-semibold">Email</label>
                                <input
                                    type="email"
                                    className="w-full p-2 rounded text-black"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block mb-1 font-semibold">Future Goals</label>
                                <textarea
                                    rows="3"
                                    className="w-full p-2 rounded text-black"
                                    value={futureGoals}
                                    onChange={(e) => setFutureGoals(e.target.value)}
                                />
                            </div>

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
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search and add course"
                                        className="w-full p-2 rounded text-black"
                                        value={courseSearchTerm}
                                        onChange={(e) => setCourseSearchTerm(e.target.value)}
                                    />
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
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search and add sport/club"
                                        className="w-full p-2 rounded text-black"
                                        value={sportSearchTerm}
                                        onChange={(e) => setSportSearchTerm(e.target.value)}
                                    />
                                    {sportResults.length > 0 && (
                                        <ul className="absolute z-10 bg-white text-black w-full mt-1 max-h-40 overflow-y-auto rounded shadow-lg">
                                            {sportResults.map((sport) => (
                                                <li
                                                    key={sport.id}
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

                <div className="text-center">
                    <button onClick={logoutUser} className="button-default">
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccountPage;
