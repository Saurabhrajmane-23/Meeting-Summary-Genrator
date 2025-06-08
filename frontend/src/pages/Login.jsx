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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Google OAuth handler
  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    // Redirect to backend Google OAuth route
    window.location.href = 'https://meeting-summary-genrator.onrender.com/api/v2/users/auth/google';
  };

  // Check for error in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    
    if (error) {
      setIsGoogleLoading(false);
      switch(error) {
        case 'authentication_failed':
          setError('Google authentication failed. Please try again.');
          break;
        case 'server_error':
          setError('Server error occurred. Please try again later.');
          break;
        default:
          setError('An error occurred during authentication.');
      }
      
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate that at least email or username is provided
    if (!formData.email && !formData.username) {
      setError("Please provide either email or username");
      return;
    }

    const formDataToSend = new FormData();
    // Only append username/email if they are not empty
    if (formData.username) formDataToSend.append('username', formData.username);
    if (formData.email) formDataToSend.append('email', formData.email);
    formDataToSend.append('password', formData.password);

    try {
      const response = await axios.post("https://meeting-summary-genrator.onrender.com/api/v2/users/login",
         formDataToSend,
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
    }
  };

  return (
    <div 
      className={`flex justify-center items-center min-h-screen font-[Arial] ${isDarkMode ? 'bg-[#0a0a0a] text-white' : 'bg-gray-100 text-gray-900'} relative`}
      style={{
        backgroundImage: 'url("/images/login2.png")',
        backgroundSize: 'auto 100%',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Add a dark overlay for dark mode to make text readable */}
      <div className={`absolute inset-0 bg-transparent`}></div>
      
      {/* Desktop Layout (hidden on mobile) */}
      <div className="hidden lg:flex justify-center items-center w-full relative z-10">
        <div className={`w-1/2 p-12 pl-45 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <h1 className="text-3xl font-bold mb-4">Quill AI</h1>
          <h2 className="text-2xl mb-6">Welcome Back</h2>
          <div className="space-y-4">
            <p className="text-lg">✓ Instant AI-powered meeting summaries</p>
            <p className="text-lg">✓ Smart action item tracking</p>
            <p className="text-lg">✓ Searchable meeting history</p>
            <p className="text-lg">✓ Team collaboration tools</p>
          </div>
        </div>

        <div className="w-1/2 flex justify-center">
          <div className={`fixed p-2.5 top-4 right-4 flex items-center gap-3 border rounded-lg ${
            isDarkMode ? 'border-gray-700' : 'border-gray-400'
          }`}>
            <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Lights
            </span>
            <button
              onClick={toggleDarkMode}
              className={`relative w-10 h-4 rounded-full transition-colors duration-200 ${
                !isDarkMode ? 'bg-[#1e90ff]' : 'bg-gray-600'
              }`}
            >
              <div
                className={`absolute top-0 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                  !isDarkMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <form onSubmit={handleSubmit} className={`p-6 w-96 ${isDarkMode ? 'bg-gray-900/20 backdrop-blur-sm border border-gray-700 text-white' : 'bg-white border border-gray-200 text-gray-900'} rounded-2xl shadow-lg`}>
            <h2 className="text-2xl font-semibold text-center mb-4">LogIn</h2>
            
            {error && (
              <div className={`${isDarkMode ? 'bg-red-900/50 border-red-800 text-red-400' : 'bg-red-50 border-red-200 text-red-700'} border px-4 py-3 rounded relative mb-4`} role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className={`w-full p-3 mb-4 rounded-lg border-2 flex items-center justify-center gap-3 transition-all duration-200 ${
                isDarkMode 
                  ? 'border-gray-700 bg-gray-900/50 text-white hover:bg-gray-800' 
                  : 'border-gray-400 bg-white text-gray-700 hover:bg-gray-50'
              } ${isGoogleLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isGoogleLoading ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {isGoogleLoading ? 'Signing in...' : 'Continue with Google'}
            </button>

            {/* Divider */}
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-400'}`}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-2 ${isDarkMode ? 'bg-gray-900/50 text-gray-400' : 'bg-white text-gray-500'}`}>
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Instruction text */}
            <p className={`text-sm text-center mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Enter either your email or username 
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full p-2 rounded border ${
                    isDarkMode 
                      ? 'text-white border-gray-700 focus:border-[#1e90ff] bg-gray-900/50' 
                      : 'text-gray-900 border-gray-400 focus:border-[#1e90ff] bg-white'
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
                  className={`w-full p-2 rounded border ${
                    isDarkMode 
                      ? 'text-white border-gray-700 focus:border-[#1e90ff] bg-gray-900/50' 
                      : 'text-gray-900 border-gray-400 focus:border-[#1e90ff] bg-white'
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
                  className={`w-full p-2 rounded border ${
                    isDarkMode 
                      ? 'text-white border-gray-700 focus:border-[#1e90ff] bg-gray-900/50' 
                      : 'text-gray-900 border-gray-400 focus:border-[#1e90ff] bg-white'
                  } transition-all duration-200`}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full p-2 mt-6 rounded-lg transition ${
                isDarkMode ? 'bg-[#1e90ff] hover:bg-[#5141e1]' : 'bg-[#1e90ff] hover:bg-[#5141e1]'
              } text-white`}
            >
              Log in
            </button>

            <div className="text-center mt-4">
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Don't have an account?</p>
              <button
                type="button"
                className={`${isDarkMode ? 'text-[#1e90ff] hover:text-[#5141e1]' : 'text-[#1e90ff] hover:text-[#5141e1]'} hover:underline`}
                onClick={() => navigate('/register')}
              >
                Sign up
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Layout (visible only on mobile) */}
      <div className="lg:hidden flex flex-col justify-center items-center w-full relative z-10 px-4 py-8">
        {/* Mobile Theme Toggle */}
        <div className={`absolute top-4 right-4 flex items-center gap-3 border ${
          isDarkMode ? 'border-gray-700' : 'border-gray-400'
        } p-2 rounded-lg`}>
          <span className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Lights
          </span>
          <button
            onClick={toggleDarkMode}
            className={`relative w-8 h-4 rounded-full transition-colors duration-200 ${
              !isDarkMode ? 'bg-[#1e90ff]' : 'bg-gray-600'
            }`}
          >
            <div
              className={`absolute top-0 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                !isDarkMode ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Mobile Header */}
        <div className={`text-center mb-8 mt-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <h1 className="text-2xl font-bold mb-2">Quill AI</h1>
          <h2 className="text-lg mb-4">Welcome Back</h2>
          <div className="space-y-2 text-sm">
            <p>✓ AI-powered meeting summaries</p>
            <p>✓ Smart action item tracking</p>
            <p>✓ Searchable meeting history</p>
            <p>✓ Team collaboration tools</p>
          </div>
        </div>

        {/* Mobile Form */}
        <form onSubmit={handleSubmit} className={`p-6 w-full max-w-sm ${isDarkMode ? 'bg-gray-900/90 backdrop-blur-sm border border-gray-700 text-white' : 'bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-900'} rounded-2xl shadow-lg`}>
          <h2 className="text-xl font-semibold text-center mb-4">LogIn</h2>
          
          {error && (
            <div className={`${isDarkMode ? 'bg-red-900/50 border-red-800 text-red-400' : 'bg-red-50 border-red-200 text-red-700'} border px-4 py-3 rounded relative mb-4`} role="alert">
              <span className="block sm:inline text-sm">{error}</span>
            </div>
          )}

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className={`w-full p-3 mb-4 rounded-lg border-2 flex items-center justify-center gap-2 transition-all duration-200 text-sm ${
              isDarkMode 
                ? 'border-gray-700 bg-gray-900/50 text-white hover:bg-gray-800' 
                : 'border-gray-400 bg-white text-gray-700 hover:bg-gray-50'
            } ${isGoogleLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isGoogleLoading ? (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {isGoogleLoading ? 'Signing in...' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-400'}`}></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className={`px-2 ${isDarkMode ? 'bg-gray-900/90 text-gray-400' : 'bg-white/90 text-gray-500'}`}>
                Or continue with email
              </span>
            </div>
          </div>

          {/* Instruction text */}
          <p className={`text-xs text-center mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Enter either your email or username 
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-3 rounded border text-sm ${
                  isDarkMode 
                    ? 'text-white border-gray-700 focus:border-[#1e90ff] bg-gray-900/50' 
                    : 'text-gray-900 border-gray-400 focus:border-[#1e90ff] bg-white'
                } transition-all duration-200`}
              />
            </div>

            <div>
              <label className="block mb-2 text-sm">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`w-full p-3 rounded border text-sm ${
                  isDarkMode 
                    ? 'text-white border-gray-700 focus:border-[#1e90ff] bg-gray-900/50' 
                    : 'text-gray-900 border-gray-400 focus:border-[#1e90ff] bg-white'
                } transition-all duration-200`}
              />
            </div>

            <div>
              <label className="block mb-2 text-sm">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full p-3 rounded border text-sm ${
                  isDarkMode 
                    ? 'text-white border-gray-700 focus:border-[#1e90ff] bg-gray-900/50' 
                    : 'text-gray-900 border-gray-400 focus:border-[#1e90ff] bg-white'
                } transition-all duration-200`}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full p-3 mt-6 rounded-lg transition text-sm ${
              isDarkMode ? 'bg-[#1e90ff] hover:bg-[#5141e1]' : 'bg-[#1e90ff] hover:bg-[#5141e1]'
            } text-white`}
          >
            Log in
          </button>

          <div className="text-center mt-4">
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Don't have an account?</p>
            <button
              type="button"
              className={`${isDarkMode ? 'text-[#1e90ff] hover:text-[#5141e1]' : 'text-[#1e90ff] hover:text-[#5141e1]'} hover:underline text-sm`}
              onClick={() => navigate('/')}
            >
              Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;