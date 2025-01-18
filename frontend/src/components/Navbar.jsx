import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const Navbar = () => {
    const { user, logoutUser } = useContext(AuthContext);

    return (
        <nav className="bg-wpiRed text-white p-4 flex justify-between items-center">
            <div className="text-xl font-bold">
                <Link to="/">SchAIdule</Link>
            </div>
            <div className="flex space-x-4">
                <Link to="/" className="hover:underline">Home</Link>
                {user ? (
                <>
                    <Link to="/account" className="hover:underline">My Account</Link>
                    <button onClick={logoutUser} className="bg-white text-wpiRed px-3 py-1 rounded hover:bg-wpiGray">
                        Logout
                    </button>
                </>
                ) : (
                <>
                    <Link to="/login" className="hover:underline">Login</Link>
                    <Link to="/register" className="hover:underline">Register</Link>
                </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
