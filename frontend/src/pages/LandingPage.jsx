import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            {/* Main section */}
            <div className="flex flex-1 items-center justify-center bg-wpiGray">
                <div className="max-w-2xl text-center p-8">
                    <h1 className="text-4xl font-bold text-wpiRed mb-4">
                        Welcome to SchAIdule
                    </h1>
                    <p className="text-lg text-wpiBlack mb-8">
                        Create the perfect schedule without the need of an academic advisor.
                    </p>
                    <Link
                        to="/register"
                        className="bg-wpiRed hover:bg-[#911F2A] text-white px-6 py-3 rounded font-semibold"
                    >
                        Get Started
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
