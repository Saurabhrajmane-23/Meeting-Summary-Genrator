import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Store the token
      localStorage.setItem('accessToken', token);
      
      // Small delay to ensure token is stored
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 100);
    } else {
      // No token, redirect to login
      navigate('/login?error=authentication_failed', { replace: true });
    }
  }, [navigate, searchParams]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-lg">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthSuccess;