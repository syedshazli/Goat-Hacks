import { useState, useContext } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { CourseContext } from '../contexts/CourseContext';
import { toast } from 'react-toastify';

const ScheduleFormPage = () => {
    const { user, jwtToken } = useContext(AuthContext);
    const { academicCourses, sportsCourses } = useContext(CourseContext);

    const navigate = useNavigate();

    // Initialize from user's data, if any
    const [completedCourses, setCompletedCourses] = useState(user?.completedCourses || []);
    const [sports, setSports] = useState(user?.sports || []);
    const [futureGoals, setFutureGoals] = useState(user?.futureGoals || '');

    // Local search states
    const [academicSearch, setAcademicSearch] = useState('');
    const [sportsSearch, setSportsSearch] = useState('');

    // Filter for the search
    const filteredAcademic = academicCourses.filter((course) => 
        course.course_title.toLowerCase().includes(academicSearch.toLowerCase())
    );
    const filteredSports = sportsCourses.filter((course) => 
        course.course_title.toLowerCase().includes(sportsSearch.toLowerCase())
    );

    // Add a course to completedCourses
    const handleAddAcademicCourse = (name) => {
        if (!completedCourses.includes(name)) setCompletedCourses((prev) => [...prev, name]);
        setAcademicSearch(''); // Clear search
    };

    // Add a course to sports
    const handleAddSport = (name) => {
        if (!sports.includes(name)) setSports((prev) => [...prev, name]);
        setSportsSearch(''); // Clear search
    };

    // Remove a course from completedCourses
    const removeAcademicCourse = (name) => {
        setCompletedCourses((prev) => prev.filter((c) => c !== name));
    };

    // Remove a course from sports
    const removeSport = (name) => {
        setSports((prev) => prev.filter((c) => c !== name));
    };

    // Redirect to login if no jwtToken
    if (!jwtToken) {
        navigate('/login');
        return;
    }

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
                        <div className="flex flex-wrap gap-2 mb-2">
                            {/* Display completed courses */}
                            {completedCourses.map((course, idx) => (
                                <span
                                    key={idx}
                                    className="bg-white/30 px-2 py-1 rounded-full text-sm flex items-center space-x-2"
                                >
                                    <span>{course}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeAcademicCourse(course)}
                                        className="hover:text-red-300"
                                    >
                                        &times;
                                    </button>
                                </span>
                            ))}
                        </div>

                        {/* Academic Course Search */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search academic courses..."
                                className="w-full p-2 rounded text-black"
                                value={academicSearch}
                                onChange={(e) => setAcademicSearch(e.target.value)}
                            />
                            {/* Display search results */}
                            {academicSearch && filteredAcademic?.length > 0 && (
                                <ul className="absolute z-10 bg-white text-black w-full mt-1 max-h-60 overflow-y-auto rounded shadow-lg">
                                    {filteredAcademic.map((course) => (
                                        <li
                                            key={course.id}
                                            className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                                            onClick={() => handleAddAcademicCourse(course.course_title)}
                                        >
                                            {course.course_title} ({course.course_section})
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Sports Section */}
                    <div className="mb-6">
                        <label className="block mb-1 font-semibold text-lg">Sports</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {/* Display sports */}
                            {sports.map((sport, idx) => (
                                <span
                                    key={idx}
                                    className="bg-white/30 px-2 py-1 rounded-full text-sm flex items-center space-x-2"
                                >
                                    <span>{sport}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeSport(sport)}
                                        className="hover:text-red-300"
                                    >
                                        &times;
                                    </button>
                                </span>
                            ))}
                        </div>

                        {/* Sports Search */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search and add sport/club"
                                className="w-full p-2 rounded text-black"
                                value={sportsSearch}
                                onChange={(e) => setSportsSearch(e.target.value)}
                            />
                            {/* Display search results */}
                            {sportsSearch && filteredSports?.length > 0 && (
                                <ul className="absolute z-10 bg-white text-black w-full mt-1 max-h-40 overflow-y-auto rounded shadow-lg">
                                    {filteredSports.map((sport) => (
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
