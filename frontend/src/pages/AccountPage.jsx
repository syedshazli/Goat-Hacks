import { useContext, useState } from 'react';
import Navbar from '../components/Navbar';
import { AuthContext } from '../contexts/AuthContext';

const AccountPage = () => {
    const { user, loginUser } = useContext(AuthContext);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({ name: user?.name || '', email: user?.email || '' });

    // Submit form data to the backend
    const handleSave = () => {
        fetch('/update-account', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        })
        .then((res) => {
            if (!res.ok) throw new Error('Update failed');
            return res.json();
        })
        .then((data) => {
            // update user in context
            loginUser(data.updatedUser);
            setEditing(false);
        })
        .catch((err) => console.log(err));
    };

    // If user is not logged in, display a message
    if (!user) {
        return (
            <div className="min-h-screen bg-wpiGray">
                <Navbar />
                <div className="p-10 text-center">
                    <h1 className="text-2xl">You are not logged in</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-wpiGray">
            <Navbar />
            <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
                <h2 className="text-2xl font-semibold mb-4">My Account</h2>

                {/* Edit form */}
                {editing ? (
                    <div>

                        {/* Name field */}
                        <div className="mb-4">
                            <label className="block mb-1">Name</label>
                            <input
                                className="border border-gray-300 p-2 w-full rounded"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value }) }
                            />
                        </div>

                        {/* Email field */}
                        <div className="mb-4">
                            <label className="block mb-1">Email</label>
                            <input
                                className="border border-gray-300 p-2 w-full rounded"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value }) }
                            />
                        </div>

                        {/* Save button */}
                        <button
                            onClick={handleSave}
                            className="bg-wpiRed text-white py-2 px-4 rounded hover:bg-[#911F2A] mr-2"
                        >
                            Save
                        </button>

                        {/* Cancel button */}
                        <button
                            onClick={() => setEditing(false)}
                            className="bg-gray-300 text-black py-2 px-4 rounded hover:bg-gray-400"
                        >
                            Cancel
                        </button>

                    </div>
                ) : (
                    <div>
                        {/* Display user info */}
                        <p className="mb-2"><b>Name:</b>{user?.name}</p>
                        <p className="mb-2"><b>Email:</b> {user?.email}</p>
                        <button
                            onClick={() => setEditing(true)}
                            className="bg-wpiRed text-white py-2 px-4 rounded hover:bg-[#911F2A]"
                        >
                            Edit
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccountPage;
