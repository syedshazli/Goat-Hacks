import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccountPage from './pages/AccountPage';
import ScheduleFormPage from './pages/ScheduleFormPage';
import DisplaySchedulesPage from './pages/DisplaySchedulesPage';
import ProtectedRoute from './components/ProtectedRoute';


const App = () => {
    return (
        <>
            <ToastContainer />
            <Routes>
                <Route index element={<LandingPage />} />
                <Route path="/" element={<LandingPage />} />
                <Route path="/home" element={<LandingPage />} />

                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected routes */}
                <Route path="/account" element={
                    <ProtectedRoute>
                        <AccountPage />
                    </ProtectedRoute>
                    }
                />
                <Route path="/schedule-form" element={
                    <ProtectedRoute>
                        <ScheduleFormPage />
                    </ProtectedRoute>
                    }
                />
                <Route path="/display-schedules" element={
                    <ProtectedRoute>
                        <DisplaySchedulesPage />
                    </ProtectedRoute>
                    }
                />
            </Routes>
        </>
    );
}

export default App;