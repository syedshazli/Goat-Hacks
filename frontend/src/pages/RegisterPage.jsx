import { useState, useContext } from 'react';
import Navbar from '../components/Navbar';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const RegisterPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const { loginUser } = useContext(AuthContext);
    const navigate = useNavigate();

    // Register the user
    const handleRegister = (e) => {
        e.preventDefault();

        fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        })
        .then(async (res) => {
            const data = await res.json();
            if (!res.ok) {
                const error = data.message || 'Registration failed';
                toast.error(error);
                throw new Error(error);
            }
            return data;
        })
        .then((data) => {
            toast.success('Registration successful');
            loginUser({ userData: data.user, jwtToken: data.access_token });
            // Navigate to the account page
            navigate('/account');
        })
        .catch((err) => {
            console.error(err);
            alert(err.message || 'Registration failed. Please try again.');
        });
    };

    return (
        <div className="min-h-screen bg-[#AC2B37] text-white">
            <Navbar />

            {/* Register Form */}
            <div className="flex items-center justify-center pt-24 pb-8 px-4">
                <form
                    onSubmit={handleRegister}
                    className="glass p-8 w-full max-w-md  rounded-xl shadow-xl"
                >
                    <h2 className="text-3xl font-bold mb-6 text-center">Register</h2>

                    {/* Name Field */}
                    <div className="mb-4">
                        <label className="block mb-1">Name</label>
                        <input
                            type="text"
                            className="w-full p-2 rounded text-black"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

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
                        Register
                    </button>
                </form>
            </div>

        </div>
    );
};

export default RegisterPage;
