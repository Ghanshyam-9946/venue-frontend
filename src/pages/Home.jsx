import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import LandingPage from './LandingPage';

const Home = () => {
    const { user, isAuthenticated, loading } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && isAuthenticated) {
            if (['admin', 'superadmin'].includes(user?.role)) {
                navigate('/admin/dashboard');
            } else {
                navigate('/venues');
            }
        }
    }, [user, isAuthenticated, loading, navigate]);

    if (loading) return null;
    
    if (!isAuthenticated) {
        return <LandingPage />;
    }

    return null;
};

export default Home;
