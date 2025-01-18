// src/pages/DisplaySchedulesPage.js
import React, { useContext } from 'react';
import Navbar from '../components/Navbar';
import { CourseContext } from '../contexts/CourseContext';
import { Link } from 'react-router-dom';

const DisplaySchedulesPage = () => {
    const { schedules, loadingSchedules, errorSchedules } = useContext(CourseContext);

    return (
        <div className="min-h-screen bg-[#AC2B37] text-white">
            <Navbar />

            {/* Display Schedules */}
            <div className="max-w-5xl mx-auto py-24 px-4">
                <div className="glass p-6 sm:p-8 rounded-2xl shadow-xl">
                    <h2 className="text-3xl font-bold mb-6 text-center">
                        Recommended Schedules
                    </h2>

                    {/* Schedules Grid */}
                    {loadingSchedules ? (
                        <p>Loading...</p>
                    ) : errorSchedules ? (
                        <p className="text-red-500">Error: {errorSchedules}</p>
                    ) : !schedules || schedules.length === 0 ? (
                        <p className="text-center">No schedules found. Try again.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {schedules.map((schedule, index) => (
                                <div key={index} className="bg-white/10 p-4 rounded shadow">
                                    <h3 className="text-xl font-semibold mb-2">
                                        Schedule Option {index + 1}
                                    </h3>
                                    <ul className="list-disc list-inside">
                                        {schedule.courseIds?.map((courseId, idx) => (
                                        <li key={idx}>Course ID: {courseId}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Generate Another Button */}
                    <div className="text-center mt-6">
                        <Link
                            to="/schedule-form"
                            className="
                                inline-block bg-white text-[#AC2B37] font-semibold 
                                px-6 py-2 rounded-full shadow 
                                hover:bg-[#f0f0f0] transition duration-300
                            "
                        >
                            Generate Another
                        </Link>
                    </div>

                </div>
            </div>

        </div>
    );
};

export default DisplaySchedulesPage;
