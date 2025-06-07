import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

function AuthSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Store the token in localStorage or handle it as needed
      localStorage.setItem('accessToken', token);
      
      // Set a cookie if needed (though the backend should have already set it)
      document.cookie = `accessToken=${token}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=none`;
      
      // Redirect to dashboard or home page
      setTimeout(() => {
        navigate('/dashboard'); // or wherever you want to redirect after successful login
      }, 1000);
    } else {
      // No token found, redirect to login with error
      navigate('/login?error=no_token');
    }
  }, [navigate, searchParams]);

  return (
    <div className={`flex justify-center items-center min-h-screen ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
    }`}>
      <div className="text-center">
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
          isDarkMode ? 'border-blue-400' : 'border-blue-500'
        } mx-auto mb-4`}></div>
        <h2 className={`text-xl font-semibold ${
          isDarkMode ? 'text-gray-100' : 'text-gray-700'
        }`}>
          Authentication Successful!
        </h2>
        <p className={`mt-2 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-500'
        }`}>
          Redirecting you to your dashboard...
        </p>
      </div>
    </div>
  );
}

export default AuthSuccess;