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
    <div className={`flex justify-center items-center min-h-screen px-4 sm:px-6 lg:px-8 ${
      isDarkMode ? 'bg-[#0a0a0a]' : 'bg-[#f3f4f6]'
    }`}>
      <div className="text-center max-w-md w-full mx-auto">
        {/* Loading Spinner - responsive size */}
        <div className={`animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 border-b-2 border-t-2 ${
          isDarkMode ? 'border-blue-400' : 'border-blue-500'
        } mx-auto mb-4 sm:mb-6`}></div>
        
        {/* Success Message - responsive typography */}
        <h2 className={`text-lg sm:text-xl lg:text-2xl font-semibold mb-2 ${
          isDarkMode ? 'text-gray-100' : 'text-gray-800'
        }`}>
          Authentication Successful!
        </h2>
        
        {/* Subtext - responsive typography */}
        <p className={`text-sm sm:text-base lg:text-lg ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Redirecting you to your dashboard...
        </p>
        
        {/* Optional: Progress indicator dots */}
        <div className="flex justify-center mt-4 sm:mt-6 space-x-1">
          <div className={`w-2 h-2 rounded-full animate-pulse ${
            isDarkMode ? 'bg-blue-400' : 'bg-blue-500'
          }`} style={{ animationDelay: '0ms' }}></div>
          <div className={`w-2 h-2 rounded-full animate-pulse ${
            isDarkMode ? 'bg-blue-400' : 'bg-blue-500'
          }`} style={{ animationDelay: '150ms' }}></div>
          <div className={`w-2 h-2 rounded-full animate-pulse ${
            isDarkMode ? 'bg-blue-400' : 'bg-blue-500'
          }`} style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}

export default AuthSuccess;