import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';

const App = () => {
    return (
        <Routes>
            <Route index element={<LandingPage />} />
        </Routes>
    );
}

export default App;
