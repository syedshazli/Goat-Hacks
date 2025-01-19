import { useState, useContext } from 'react';
import Navbar from '../components/Navbar';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { loginUser } = useContext(AuthContext);
    const navigate = useNavigate();

    // Login the user
    const handleLogin = (e) => {
        e.preventDefault();

        fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        })
        .then(async (res) => {
            const data = await res.json();
            if (!res.ok) {
                const error = data.message || 'Login failed';
                toast.error(error);
                throw new Error(error);
            }
            return data;
        })
        .then((data) => {
            loginUser({ userData: data.user, jwtToken: data.access_token }); // Store user data in context
            toast.success('Login successful');
            navigate('/schedule-form');
        })
        .catch((err) => {
            console.error(err);
        });
    };

    return (
        <div className="min-h-screen">
            <Navbar />

            {/* Login Form */}
            <div className="flex items-center justify-center pt-24 pb-8 px-4">
                <form
                    onSubmit={handleLogin}
                    className="glass p-8 w-full max-w-md rounded-xl shadow-xl"
                >
                    <h2 className="text-3xl font-bold mb-6 text-center">Login</h2>

                    {/* Email Field */}
                    <div className="mb-4">
                        <label className="block mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full p-2 rounded text-black"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    {/* Password Field */}
                    <div className="mb-6">
                        <label className="block mb-1">Password</label>
                        <input
                            type="password"
                            className="w-full p-2 rounded text-black"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="button-default w-full"
                    >
                        Login
                    </button>

                </form>
            </div>

        </div>
    );
};

export default LoginPage;
