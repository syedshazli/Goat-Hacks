import { Routes, Route } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccountPage from './pages/AccountPage';
import ScheduleFormPage from './pages/ScheduleFormPage';
import DisplaySchedulesPage from './pages/DisplaySchedulesPage';
const App = () => {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/schedule-form" element={<ScheduleFormPage />} />
            <Route path="/display-schedules" element={<DisplaySchedulesPage />} />
        </Routes>
    );
}

export default App;
