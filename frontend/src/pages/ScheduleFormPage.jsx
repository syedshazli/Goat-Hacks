import { useState, useContext } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { CourseContext } from '../contexts/CourseContext';
import { toast } from 'react-toastify';

const ScheduleFormPage = () => {
    const { user, jwtToken } = useContext(AuthContext);
    const { academicCourses, sportsCourses, fetchSchedules } = useContext(CourseContext);

    const navigate = useNavigate();

    // Initialize from user's data, if any
    const [completedCourses, setCompletedCourses] = useState(user?.completedCourses|| []);
    const [sports, setSports] = useState(user?.sports || []);
    const [futureGoals, setFutureGoals] = useState(user?.futureGoals || '');

    // Local search states
    const [academicSearch, setAcademicSearch] = useState('');
    const [sportsSearch, setSportsSearch] = useState('');

    // Filter for the search
    const filteredAcademic = academicCourses.filter((course) => course.course_title.toLowerCase().includes(academicSearch.toLowerCase()));
    const filteredSports = sportsCourses.filter((course) => course.course_title.toLowerCase().includes(sportsSearch.toLowerCase()));

    // Add a course to completedCourses
    const handleAddAcademicCourse = (name) => {
        if (!completedCourses.includes(name)) setCompletedCourses((prev) => [...prev, name]);
    };

    // Add a course to sports
    const handleAddSport = (name) => {
        if (!sports.includes(name)) setSports((prev) => [...prev, name]);
    };

    // Remove a course from completedCourses
    const removeAcademicCourse = (name) => {
        setCompletedCourses((prev) => prev.filter((c) => c !== name));
    };

    // Remove a course from sports
    const removeSport = (name) => {
        setSports((prev) => prev.filter((c) => c !== name));
    };

    // Submit the form data
    const handleSubmit = (e) => {
        e.preventDefault();

        // Update user's profile with new data
        const updatedProfile = { completedCourses, sports, futureGoals };

        fetch('/api/update-account', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwtToken}`
            },
            body: JSON.stringify(updatedProfile),
        })
        .then((res) => {
            if (!res.ok) {
                toast.error('Error updating profile');
                throw new Error('Error updating profile');
            }
            toast.success('Profile updated successfully');
            return res.json();
        })
        .then(() => {
            // Call generate schedule
            return fetch('/api/generate-schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwtToken}` },
                body: JSON.stringify(...user),
            });
        })
        .then((res) => {
            if (!res.ok) {
                toast.error('Error generating schedule');
                throw new Error('Error generating schedule');
            }
            toast.success('Schedule generated successfully');
            return res.json();
        })
        .then(() => {
            // Refetch schedules in context
            fetchSchedules();

            // Navigate to display schedules
            navigate('/display-schedules');
        })
        .catch((err) => console.error(err));
    };

    return (
        <div className="min-h-screen bg-[#AC2B37] text-white">
            <Navbar />
            
            <div className="flex items-center justify-center pt-24 pb-8 px-4">
                {/* Generate Schedule Form */}
                <form onSubmit={handleSubmit} className="glass p-8 w-full max-w-2xl rounded-xl shadow-xl">
                    <h2 className="text-3xl font-bold mb-6 text-center">Generate Schedule</h2>

                    {/* Completed Courses Section */}
                    <div className="mb-6">
                        <label className="block mb-1 font-semibold text-lg">Completed Courses</label>
                        <p className="text-sm mb-2">
                            These are the academic courses you've finished.
                        </p>
                        
                        {/* Display existing academic courses */}
                        <div className="flex flex-wrap gap-2 mb-2">
                        {completedCourses.map((courseName, idx) => (
                            <span
                                key={idx}
                                className="bg-white/30 px-2 py-1 rounded-full text-sm flex items-center space-x-2"
                            >
                                <span>{courseName}</span>
                                <button
                                    type="button"
                                    onClick={() => removeAcademicCourse(courseName)}
                                    className="hover:text-red-300"
                                >
                                    &times;
                                </button>
                            </span>
                        ))}
                        </div>

                        {/* Academic Course Search */}
                        <div className="mb-2">
                            <input
                                type="text"
                                placeholder="Search academic courses..."
                                className="w-full p-2 rounded text-black"
                                value={academicSearch}
                                onChange={(e) => setAcademicSearch(e.target.value)}
                            />
                        </div>

                        {/* Academic Course Search Results */}
                        {academicSearch && (
                            <div className="max-h-32 overflow-y-auto bg-white/20 p-2 rounded">
                                {academicSearch && filteredAcademic.map((course) => (
                                    <div key={course.id} className="flex justify-between items-center mb-1">
                                        <span className="text-sm">{course.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleAddAcademicCourse(course.name)}
                                            className="bg-white text-[#AC2B37] rounded px-2 py-1 text-sm"
                                        >
                                            Add
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>

                    {/* Sports Section */}
                    <div className="mb-6">
                        <label className="block mb-1 font-semibold text-lg">Sports</label>
                        <p className="text-sm mb-2">Add any club or varsity teams you're participating in.</p>

                        {/* Display existing sports */}
                        <div className="flex flex-wrap gap-2 mb-2">
                            {sports.map((sportName, idx) => (
                                <span
                                    key={idx}
                                    className="bg-white/30 px-2 py-1 rounded-full text-sm flex items-center space-x-2"
                                >
                                    <span>{sportName}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeSport(sportName)}
                                        className="hover:text-red-300"
                                    >
                                        &times;
                                    </button>
                                </span>
                            ))}
                        </div>

                        {/* Sports Course Search */}
                        <div className="mb-2">
                            <input
                                type="text"
                                placeholder="Search sports..."
                                className="w-full p-2 rounded text-black"
                                value={sportsSearch}
                                onChange={(e) => setSportsSearch(e.target.value)}
                            />
                        </div>

                        {/* Sports Course Search Results */}
                        {sportsSearch && (
                            <div className="max-h-32 overflow-y-auto bg-white/20 p-2 rounded">
                                {sportsSearch && filteredSports.map((course) => (
                                    <div key={course.id} className="flex justify-between items-center mb-1">
                                        <span className="text-sm">{course.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleAddSport(course.name)}
                                            className="bg-white text-[#AC2B37] rounded px-2 py-1 text-sm"
                                        >
                                            Add
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>

                    {/* Future Goals Section */}
                    <div className="mb-6">
                        <label className="block mb-1 font-semibold text-lg">Future Goals</label>
                        <p className="text-sm mb-2">What path do you want to take at WPI? Be descriptive!</p>
                        <textarea
                            className="w-full p-2 rounded text-black"
                            rows="4"
                            value={futureGoals}
                            onChange={(e) => setFutureGoals(e.target.value)}
                        />
                    </div>

                    {/* Submit Button */}
                    <button type="submit" className="button-default w-full">
                        Generate Schedule
                    </button>

                </form>
            </div>
        </div>
    );
};

export default ScheduleFormPage;
