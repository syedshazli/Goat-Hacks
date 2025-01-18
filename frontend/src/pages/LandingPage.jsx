import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

// Features list
const features = [
    {
        title: 'Smart Course Selection',
        description:
        'AI-driven suggestions based on prerequisites, goals, and personal preferences.',
    },
    {
        title: 'Time Management',
        description:
        'Optimize your schedule around sports, clubs, and part-time jobs.',
    },
    {
        title: 'Personalized Recommendations',
        description:
        'Tailored suggestions for your career path and academic plan.',
    },
];

const LandingPage = () => {
    return (
        <div className="min-h-screen">
            <Navbar />

            {/* Hero Section */}
            <div className="flex flex-col items-center justify-center text-center pt-24 pb-16 px-4">
                <h1 className="text-5xl font-extrabold mb-4 leading-tight drop-shadow-md">
                    Welcome to SchAIdule
                </h1>
                <p className="text-lg max-w-2xl mb-8">
                    Craft your perfect course schedule with our AI-powered planner. 
                    Balance academics, extracurriculars, and more.
                </p>
                <Link
                    to="/register"
                    className="
                        inline-block bg-white text-[#AC2B37] font-semibold px-8 py-3 rounded-full 
                        shadow-md hover:bg-[#f0f0f0] transition duration-300 
                        transform hover:scale-105
                    "
                >
                    Get Started
                </Link>
            </div>

            {/* Feature List Section */}
            <div className="px-4 pb-16">
                <div className="glass max-w-5xl mx-auto p-6 sm:p-10 rounded-2xl shadow-xl text-center">
                    
                    {/* Section Title */}
                    <h2 className="text-3xl font-bold mb-6">Why SchAIdule?</h2>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {features.map((f, idx) => (
                        <div
                            key={idx}
                            className="bg-white/5 rounded-lg px-4 py-6 hover:bg-white/10 transition-colors"
                        >
                            <h3 className="font-semibold text-xl mb-2">{f.title}</h3>
                            <p className="text-sm">{f.description}</p>
                        </div>
                        ))}
                    </div>

                    {/* Build Schedule Button */}
                    <div className="mt-8">
                        <Link
                            to="/schedule-form"
                            className="
                                inline-block bg-white text-[#AC2B37] font-semibold px-6 py-2 
                                rounded-full shadow hover:bg-[#f0f0f0] 
                                transition duration-300 transform hover:scale-105
                            "
                        >
                            Build My Schedule
                        </Link>
                    </div>
                </div>
            </div>
            
        </div>
    );
};

export default LandingPage;
