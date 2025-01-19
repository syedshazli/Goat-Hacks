import { useState, useEffect, useContext, useRef } from 'react';
import Navbar from '../components/Navbar';
import { AuthContext } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ReactMarkdown from 'react-markdown';

const DisplaySchedulesPage = () => {
    const { jwtToken, user } = useContext(AuthContext);
    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const retryCount = useRef(0);
    const maxRetries = 3;
    const retryDelay = 10;

    const fetchSchedule = async () => {
        try {
            const response = await fetch('/api/generate-schedule', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${jwtToken}`,
                },
                body: JSON.stringify({ userData: user }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to generate schedule');
            }

            const data = await response.json();

            // This is a cheating way bc swarm is being weird
            const isValid = data.schedule?.recommendations.join("").includes("final");

            if (isValid) {
                setSchedule(data.schedule);
                setLoading(false);
            } else {
                throw new Error('Failed to generate a valid schedule. Please try again.');
            }
        } catch (err) {
            retryCount.current += 1;
            if (retryCount.current <= maxRetries) {
                setTimeout(fetchSchedule, retryDelay);
            } else {
                setLoading(false);
                setError(err.message);
            }
        }
    };

    useEffect(() => {
        if (!jwtToken) {
            setLoading(false);
            setError('No valid token found');
            return;
        }
        fetchSchedule();
    }, [jwtToken]);

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
                    {loading ? (
                        <p className="text-center">Loading...</p>
                    ) : error ? (
                        <p className="text-red-500">Error: {error}</p>
                    ) : !schedule ? (
                        <p className="text-center">No schedule found. Try again.</p>
                    ) : (
                        <div className="bg-white/10 p-4 rounded shadow">
                            <h3 className="text-xl font-semibold mb-2">
                                Your Recommended Schedule
                            </h3>
                            {schedule.recommendations.map((recommendation, idx) => (
                                <ReactMarkdown key={idx} className="p-1">
                                    {recommendation}
                                </ReactMarkdown>
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
