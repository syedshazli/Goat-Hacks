import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const Navbar = () => {
    const { user, logoutUser } = useContext(AuthContext);

    return (
        <nav className="fixed w-full z-10 top-0 left-0 flex items-center justify-between py-4 px-8 text-white glass">
            {/* Logo */}
            <div className="text-2xl font-bold">
                <Link to="/">SchAIdule</Link>
            </div>

            <div className="space-x-4">
                {user ? (
                    <>
                        {/* If the user is logged in, show account and logout links */}
                        <Link to="/account" className="hover:underline transition-colors duration-200">
                            My Account
                        </Link>
                        <button onClick={logoutUser} className="hover:underline transition-colors duration-200">
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        {/* If the user is not logged in, show login and register links */}
                        <Link to="/login" className="hover:underline transition-colors duration-200">
                            Login
                        </Link>
                        <Link to="/register" className="hover:underline transition-colors duration-200">
                            Register
                        </Link>
                    </>
                )}
            </div>

        </nav>
    );
};

export default Navbar;
