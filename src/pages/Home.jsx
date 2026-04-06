import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
    const { user, isAuthenticated, loading } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated) {
                navigate('/login');
            } else if (['admin', 'superadmin'].includes(user?.role)) {
                navigate('/admin/dashboard');
            } else {
                navigate('/venues');
            }
        }
    }, [user, isAuthenticated, loading, navigate]);

    return null;
};

export default Home;
