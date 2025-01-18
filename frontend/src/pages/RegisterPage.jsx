import { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const { loginUser } = useContext(AuthContext);
    const navigate = useNavigate();

    // Register the user
    const handleRegister = (e) => {
        e.preventDefault();
        fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        })
        .then((res) => {
            if (!res.ok) {
            throw new Error('Registration failed');
            }
            return res.json();
        })
        .then((data) => {
            loginUser(data);
            navigate('/account');
        })
        .catch((err) => {
            console.error(err);
            alert('Registration failed. Please try again.');
        });
    };

    return (
        <div className="min-h-screen bg-wpiGray">
            <Navbar />

            {/* Register form */}
            <div className="flex items-center justify-center pt-10">
                <form
                    onSubmit={handleRegister}
                    className="bg-white p-6 rounded shadow w-full max-w-md"
                >
                    <h2 className="text-2xl font-semibold mb-4">Register</h2>

                    {/* Name field */}
                    <div className="mb-4">
                        <label className="block mb-1">Name</label>
                        <input
                            type="text"
                            className="border border-gray-300 p-2 w-full rounded"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            required
                        />
                    </div>

                    {/* Email field */}
                    <div className="mb-4">
                        <label className="block mb-1">Email</label>
                        <input
                            type="email"
                            className="border border-gray-300 p-2 w-full rounded"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                            required
                        />
                    </div>

                    {/* Password field */}
                    <div className="mb-4">
                        <label className="block mb-1">Password</label>
                        <input
                            type="password"
                            className="border border-gray-300 p-2 w-full rounded"
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({ ...formData, password: e.target.value })
                            }
                            required
                        />
                    </div>

                    {/* Submit button */}
                    <button
                        type="submit"
                        className="bg-wpiRed text-white py-2 px-4 rounded hover:bg-[#911F2A]"
                    >
                        Register
                    </button>

                </form>
            </div>
            
        </div>
    );
};

export default RegisterPage;
