import React, { useState } from 'react';
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
      const response = await axios.post("http://localhost:8000/api/v2/users/login",
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
              className={`w-full p-2 mt-6 rounded-lg transition ${
                isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
              } text-white`}
            >
              Log in
            </button>

            <div className="text-center mt-4">
              <p>Don't have an account?</p>
              <button
                type="button"
                className="text-blue-400 hover:underline"
                onClick={() => navigate('/')}
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