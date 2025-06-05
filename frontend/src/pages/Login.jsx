import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Google Sign-In
  useEffect(() => {
    const initializeGoogleSignIn = () => {
      // Check if Google library is fully loaded
      if (window.google?.accounts?.id?.initialize) {
        try {
          window.google.accounts.id.initialize({
            client_id: "248000115564-kg65gq2lmt3i7hus9oisbdl6kfbqmhth.apps.googleusercontent.com",
            callback: handleGoogleLogin,
            auto_select: false,
            cancel_on_tap_outside: true,
            ux_mode: 'popup'
          });
          console.log('Google Sign-In initialized successfully');
          return true;
        } catch (error) {
          console.error('Error initializing Google Sign-In:', error);
          return false;
        }
      }
      return false;
    };

    // Try to initialize immediately
    if (!initializeGoogleSignIn()) {
      // If it fails, set up a polling mechanism
      const checkGoogleLoaded = () => {
        if (initializeGoogleSignIn()) {
          return; // Success, stop polling
        }
        // Retry after 100ms, but stop after 10 seconds
        setTimeout(checkGoogleLoaded, 100);
      };
      
      // Start polling
      setTimeout(checkGoogleLoaded, 100);
    }
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleGoogleLogin = async (response) => {
    try {
      setIsLoading(true);
      setError('');

      const res = await axios.post('http://localhost:8000/api/v2/users/auth/google/login', {
        googleToken: response.credential
      });

      if (res.data.statusCode === 200) {
        localStorage.setItem('accessToken', res.data.data.accessToken);
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      } else {
        setError(res.data.message || "Google login failed");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Google login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleButtonClick = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    } else {
      // Fallback to redirect method
      window.location.href = 'http://localhost:8000/api/v2/users/auth/google';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate that at least email or username is provided
    if (!formData.email && !formData.username) {
      setError("Please provide either email or username");
      return;
    }

    setIsLoading(true);
    setError('');

    // Create request payload as JSON instead of FormData
    const loginData = {
      password: formData.password
    };

    // Add email or username to the request
    if (formData.email) {
      loginData.email = formData.email;
    }
    if (formData.username) {
      loginData.username = formData.username;
    }

    try {
      const response = await axios.post("http://localhost:8000/api/v2/users/login",
         loginData,
         {headers: { 'Content-Type': 'application/json' }}
       );

       if (response.data.statusCode === 200) {
         // Store the token in localStorage
         localStorage.setItem('accessToken', response.data.data.accessToken);
         
         // Navigate to the attempted page or dashboard
         const from = location.state?.from?.pathname || '/dashboard';
         navigate(from, { replace: true });
       } else {
         setError(response.data.message || "Login failed");
       }
    } catch (error) {
      setError(error.response?.data?.message || "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className={`flex justify-center items-center min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}
      style={{
        backgroundImage: 'url("/images/login2.png")',
        backgroundSize: 'auto 100%',
        backgroundPosition: 'center center', 
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        overflow: 'hidden'
        
      }}
    >
      <div className={`absolute inset-0 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} opacity-0`}></div>
      
      <div className="flex justify-center items-center w-full relative z-10">
        <div className={`w-1/2 p-12 pl-45 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <h1 className="text-3xl font-bold mb-4">MeetingSummary AI</h1>
          <h2 className="text-2xl mb-6">Welcome Back</h2>
          <div className="space-y-4">
            <p className="text-lg">✓ Instant AI-powered meeting summaries</p>
            <p className="text-lg">✓ Smart action item tracking</p>
            <p className="text-lg">✓ Searchable meeting history</p>
            <p className="text-lg">✓ Team collaboration tools</p>
          </div>
        </div>

        <div className="w-1/2 flex justify-center">
          <div className={`fixed p-2.5 top-4 right-4 flex items-center gap-3 border ${
            isDarkMode ? 'border-white' : 'border-gray-600'
          }`}>
            <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Lights
            </span>
            <button
              onClick={toggleDarkMode}
              className={`relative w-10 h-4 rounded-full transition-colors duration-200 ${
                isDarkMode ? 'bg-gray-600' : 'bg-blue-500'
              }`}
            >
              <div
                className={`absolute top-0 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                  isDarkMode ? 'translate-x-0.5' : 'translate-x-6'
                }`}
              />
            </button>
          </div>

          <form onSubmit={handleSubmit} className={`p-6 w-96 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
            <h2 className="text-2xl font-semibold text-center mb-4">LogIn</h2>

            {/* Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleButtonClick}
              disabled={isLoading}
              className={`w-full p-2 mb-4 rounded-lg flex items-center justify-center gap-2 border transition-all duration-200 ${
                isLoading 
                  ? 'bg-gray-500 cursor-not-allowed' 
                  : isDarkMode 
                    ? 'border-gray-600 hover:bg-gray-800 text-white' 
                    : 'border-gray-300 hover:bg-gray-50 text-gray-900'
              }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-2 ${isDarkMode ? 'bg-gray-900 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>Or</span>
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full p-2 rounded border ${
                    isDarkMode 
                      ? 'text-white border-gray-600 focus:border-blue-500 bg-gray-800' 
                      : 'text-gray-900 border-gray-300 focus:border-blue-500 bg-white'
                  } transition-all duration-200`}
                />
              </div>

              <div>
                <label className="block mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full p-2 rounded border ${
                    isDarkMode 
                      ? 'text-white border-gray-600 focus:border-blue-500 bg-gray-800' 
                      : 'text-gray-900 border-gray-300 focus:border-blue-500 bg-white'
                  } transition-all duration-200`}
                />
              </div>

              <div>
                <label className="block mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full p-2 rounded border ${
                    isDarkMode 
                      ? 'text-white border-gray-600 focus:border-blue-500 bg-gray-800' 
                      : 'text-gray-900 border-gray-300 focus:border-blue-500 bg-white'
                  } transition-all duration-200`}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full p-2 mt-6 rounded-lg transition text-white ${
                isLoading 
                  ? 'bg-gray-500 cursor-not-allowed' 
                  : isDarkMode 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isLoading ? 'Logging in...' : 'Log in'}
            </button>

            <div className="text-center mt-4">
              <p>Don't have an account?</p>
              <button
                type="button"
                className="text-blue-400 hover:underline disabled:text-gray-500 disabled:cursor-not-allowed"
                onClick={() => navigate('/')}
                disabled={isLoading}
              >
                Sign up
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;