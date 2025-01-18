import { useContext, useState } from 'react';
import Navbar from '../components/Navbar';
import { AuthContext } from '../contexts/AuthContext';

const AccountPage = () => {
    const { user, token, logoutUser } = useContext(AuthContext);

    // Make local states to allow editing
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [completedCourses, setCompletedCourses] = useState(user?.completedCourses || []);
    const [sports, setSports] = useState(user?.sports || []);
    const [futureGoals, setFutureGoals] = useState(user?.futureGoals || '');

    // Example Save Function
    const handleSaveProfile = () => {
        const updatedData = {
            name,
            email,
            completedCourses,
            sports,
            futureGoals,
        };
        fetch('/api/update-account', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updatedData),
        })
        .then((res) => {
            if (!res.ok) throw new Error('Update failed');
            return res.json();
        })
        .then((data) => {
            console.log('Profile updated:', data.updatedUser);
            setEditing(false);
        })
        .catch((err) => console.error(err));
    };

    // If user is not logged in
    if (user) {
        return (
            <div className="min-h-screen bg-[#AC2B37] text-white">
                <Navbar />
                <div className="p-10 mt-20 text-center">
                    <h1 className="text-2xl">Please login to view your profile.</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#AC2B37] text-white">
            <Navbar />
            <div className="max-w-5xl mx-auto py-24 px-4">

                {/* Glass Container */}
                <div className="glass p-6 sm:p-8 rounded-2xl shadow-xl mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-3xl font-bold">My Account</h2>
                        {!editing && (
                            <button
                                onClick={() => setEditing(true)}
                                className="button-default"
                            >
                                Edit
                            </button>
                        )}
                    </div>

                    {editing ? (
                        <div className="space-y-4">

                            {/* Name */}
                            <div>
                                <label className="block mb-1 font-semibold">Name</label>
                                <input
                                    className="w-full p-2 rounded text-black"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block mb-1 font-semibold">Email</label>
                                <input
                                    className="w-full p-2 rounded text-black"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            {/* Future Goals */}
                            <div>
                                <label className="block mb-1 font-semibold">Future Goals</label>
                                <textarea
                                    rows="3"
                                    className="w-full p-2 rounded text-black"
                                    value={futureGoals}
                                    onChange={(e) => setFutureGoals(e.target.value)}
                                />
                            </div>

                            {/* Completed Courses */}
                            <div>
                                <label className="block mb-1 font-semibold">Completed Courses</label>
                                <div className="flex flex-wrap gap-2">
                                    {completedCourses.map((course, idx) => (
                                        <span
                                            key={idx}
                                            className="bg-white/30 px-2 py-1 rounded-full text-sm flex items-center space-x-2"
                                        >
                                        <span>{course}</span>
                                        <button
                                                type="button"
                                                onClick={() =>
                                                setCompletedCourses((prev) => prev.filter((c) => c !== course))
                                            }
                                            className="hover:text-red-300"
                                        >
                                            &times;
                                        </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Sports */}
                            <div>
                                <label className="block mb-1 font-semibold">Sports / Clubs</label>
                                <div className="flex flex-wrap gap-2">
                                    {sports.map((sport, idx) => (
                                        <span
                                            key={idx}
                                            className="bg-white/30 px-2 py-1 rounded-full text-sm flex items-center space-x-2"
                                        >
                                            <span>{sport}</span>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                setSports((prev) => prev.filter((s) => s !== sport))
                                                }
                                                className="hover:text-red-300"
                                            >
                                                &times;
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Save and Cancel Buttons */}
                            <div className="mt-4 flex gap-2">
                                <button onClick={handleSaveProfile} className="button-default">
                                    Save
                                </button>
                                <button onClick={() => setEditing(false)} className=" button-default text-black active:bg-gray-200">
                                Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        // Display mode
                        <div className="space-y-3">
                            <p><b>Name:</b> {name}</p>
                            <p><b>Email:</b> {email}</p>
                            <p><b>Future Goals:</b> {futureGoals || 'N/A'}</p>
                            <p>
                                <b>Completed Courses:</b>{' '}
                                {completedCourses.length > 0 ? completedCourses.join(', ') : 'None'}
                            </p>
                            <p>
                                <b>Sports / Clubs:</b>{' '}
                                {sports.length > 0 ? sports.join(', ') : 'None'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Logout Button */}
                <div className="text-center">
                    <button onClick={logoutUser} className="button-default">
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccountPage;
