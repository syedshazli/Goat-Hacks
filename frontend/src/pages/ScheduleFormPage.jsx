import { useState } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

const ScheduleFormPage = () => {
    const [formData, setFormData] = useState({ coursesCompleted: '', futureGoals: '', preferredDays: '' });
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        fetch('/api/generate-schedule', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        })
        .then((res) => {
            if (!res.ok) throw new Error('Error generating schedule');
            return res.json();
        })
        .then((data) => {

            navigate('/display-schedules', { state: { schedules: data.schedules } });
        })
        .catch((err) => console.log(err));
    };

    return (
        <div className="min-h-screen bg-wpiGray">
            <Navbar />
            <div className="max-w-lg mx-auto mt-10 bg-white p-6 rounded shadow">
                <h2 className="text-2xl font-semibold mb-4">Generate Schedule</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-1">Courses Completed</label>
                        <input
                        type="text"
                        className="border border-gray-300 p-2 w-full rounded"
                        value={formData.coursesCompleted}
                        onChange={(e) =>
                            setFormData({ ...formData, coursesCompleted: e.target.value })
                        }
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1">Future Goals</label>
                        <input
                        type="text"
                        className="border border-gray-300 p-2 w-full rounded"
                        value={formData.futureGoals}
                        onChange={(e) =>
                            setFormData({ ...formData, futureGoals: e.target.value })
                        }
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1">Preferred Days</label>
                        <input
                        type="text"
                        className="border border-gray-300 p-2 w-full rounded"
                        value={formData.preferredDays}
                        onChange={(e) =>
                            setFormData({ ...formData, preferredDays: e.target.value })
                        }
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-wpiRed text-white py-2 px-4 rounded hover:bg-[#911F2A]"
                    >
                        Generate
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ScheduleFormPage;
