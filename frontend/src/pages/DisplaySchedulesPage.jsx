import { useContext } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { CourseContext } from '../contexts/CourseContext';

const ScheduleCard = ({ schedule, courses }) => {
    // Helper function to get course details by ID
    const getCourseDetails = (courseId) => {
        return courses.find(course => course.id === courseId);
    };

    return (
        <div className="bg-white rounded shadow p-4">
            <h3 className="text-xl font-bold mb-2">Schedule Option</h3>

            {/* Display courses */}
            <ul className="list-disc list-inside">
                {schedule.courseIds?.map((courseId, idx) => {
                    const course = getCourseDetails(courseId);
                    if (!course) return null; // If missing a course
                    return (
                        <li key={idx} className="mb-1">
                            <strong>{course.name}</strong>: {course.day} {course.time}
                        </li>
                    );
                })}
            </ul>

        </div>
    );
};

const DisplaySchedulesPage = () => {
    const { courses, schedules, loadingCourses, loadingSchedules, errorCourses, errorSchedules } = useContext(CourseContext);

    // Loading state
    if (loadingCourses || loadingSchedules) {
        return (
            <div className="min-h-screen bg-wpiGray">
                <Navbar />
                <div className="flex items-center justify-center pt-10">
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (errorCourses || errorSchedules) {
        return (
            <div className="min-h-screen bg-wpiGray">
                <Navbar />
                <div className="flex items-center justify-center pt-10">
                    <p>Error: {errorCourses || errorSchedules}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-wpiGray">
            <Navbar />

            {/* Main section */}
            <div className="max-w-5xl mx-auto pt-10">
                <h2 className="text-3xl font-semibold mb-6 text-center">
                    Recommended Schedules
                </h2>

                {/* Display schedules */} 
                {schedules.length === 0 ? (
                    <p className="text-center">No schedules found. Try again.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {schedules.map((schedule, index) => (
                            <ScheduleCard
                                key={index}
                                schedule={schedule}
                                courses={courses}
                            />
                        ))}
                    </div>
                )}

                {/* Generate another schedule */}
                <div className="text-center mt-6">
                    <Link
                        to="/schedule-form"
                        className="bg-wpiRed text-white py-2 px-4 rounded hover:bg-[#911F2A]"
                    >
                        Generate Another
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default DisplaySchedulesPage;