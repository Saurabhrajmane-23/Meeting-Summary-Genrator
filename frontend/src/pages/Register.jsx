import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

function Register() {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    avatar: null,
    password: ''
  });

  const [isVerificationStep, setIsVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [emailToVerify, setEmailToVerify] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Initialize Google Sign-In with proper error handling
  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: "248000115564-kg65gq2lmt3i7hus9oisbdl6kfbqmhth.apps.googleusercontent.com",
            callback: handleGoogleSignup,
            auto_select: false,
            cancel_on_tap_outside: true,
            ux_mode: 'popup'
          });
          console.log('Google Sign-In initialized successfully');
        } catch (error) {
          console.error('Error initializing Google Sign-In:', error);
        }
      } else {
        // Retry after a short delay if Google hasn't loaded yet
        setTimeout(initializeGoogleSignIn, 100);
      }
    };

    // Add a longer delay to ensure script is fully loaded
    const timer = setTimeout(() => {
      const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (script) {
        script.onload = initializeGoogleSignIn;
        if (script.readyState === 'complete') {
          initializeGoogleSignIn();
        }
      } else {
        initializeGoogleSignIn();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleGoogleSignup = async (response) => {
    try {
      setIsLoading(true);
      setError('');

      const res = await axios.post('http://localhost:8000/api/v2/users/auth/google/login', {
        googleToken: response.credential
      });

      if (res.data.statusCode === 200) {
        localStorage.setItem('accessToken ', res.data.data.accessToken);
        navigate('/dashboard');
      } else {
        setError(res.data.message || "Google signup failed");
      }
    } catch (error) {
      console.error('Google signup error:', error);
      setError(error.response?.data?.message || "Google signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleButtonClick = () => {
    try {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.prompt();
      } else {
        setError('Google Sign-In not loaded. Please refresh the page.');
      }
    } catch (error) {
      console.error('Error triggering Google Sign-In:', error);
      setError('Failed to initialize Google Sign-In');
    }
  };

  const handleChange = (e) => {
    if (e.target.name === "avatar") {
      setFormData({ ...formData, avatar: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    const formDataToSend = new FormData();
    formDataToSend.append('username', formData.username);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('avatar', formData.avatar);
    formDataToSend.append('password', formData.password);
    try {
      const response = await axios.post(
        "http://localhost:8000/api/v2/users/register",
        formDataToSend,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      if (response.data.statusCode === 200) {
        // Check if user already exists
        if (response.data.message === "User already exists") {
          setError("An account with this username or email already exists. Please try with different credentials or login instead.");
        } else {
          // New user registered successfully
          setSuccess("Registration successful! Please check your email for the verification code.");
          setEmailToVerify(formData.email);
          setIsVerificationStep(true);
        }
      } else {
        setError(response.data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.log('Error: ', error);
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    
    try {
      const res = await axios.post("http://localhost:8000/api/v2/users/verify-email", {
        email: emailToVerify,
        code: verificationCode
      });
      console.log(res.data);
      if (res.data.statusCode === 200) {
        alert("Email verified successfully!");
        navigate('/login');
      }
      else {
        alert(res.data.message);
      }
    } catch (err) {
      console.log(err);
      alert("Invalid or expired verification code.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div
      className={`flex justify-center items-center min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}
      style={{
        backgroundImage: 'url("/images/image2.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center bottom',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div className={`absolute inset-0 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} opacity-0`}></div>

      <div className="flex justify-center items-center w-full relative z-10">
        <div className={`w-1/2 p-12 pl-45 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <h1 className="text-3xl font-bold mb-4">MeetingSummary AI</h1>
          <h2 className="text-2xl mb-6">Welcome to the future of meeting management</h2>
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

          {!isVerificationStep ? (
            <form onSubmit={handleSubmit} className={`p-6 w-96 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
              <h2 className="text-2xl font-semibold text-center mb-4">Create Your Account</h2>
              
              {/* Google Signup Button */}
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
              
              {/* Error Message */}
              {error && (
                <div className={`mb-4 p-3 ${isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-300 text-gray-900'} rounded-md`}>
                  {error}
                </div>
              )}
              
              {/* Success Message */}
              {success && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                  {success}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block mb-2">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`w-full p-2 rounded border ${isDarkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full p-2 rounded border ${isDarkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block mb-2">Avatar</label>
                  <input
                    type="file"
                    name="avatar"
                    onChange={handleChange}
                    className={`w-full p-2 rounded border ${isDarkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
                    accept="image/*"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full p-2 rounded border ${isDarkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full p-2 mt-6 rounded-lg flex items-center justify-center gap-2 text-white transition-all duration-200 ${
                  isLoading 
                    ? 'bg-gray-500 cursor-not-allowed' 
                    : isDarkMode 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  'Register'
                )}
              </button>

              <div className="text-center mt-4">
                <p>Already have an account?</p>
                <button 
                  type="button" 
                  className="text-blue-400 hover:underline disabled:text-gray-500 disabled:cursor-not-allowed" 
                  onClick={() => navigate('/login')}
                  disabled={isLoading}
                >
                  Login
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerify} className={`p-4 -mt-21 w-96 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
              <h2 className="text-2xl font-semibold text-center mb-4">Verify Your Email</h2>
              <p className="text-sm mb-2 text-center">I've sent a verification code to <strong>{emailToVerify}</strong></p>

              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className={`w-full p-2 rounded border mt-2 mb-4 ${isDarkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
                placeholder="Enter verification code"
                required
                disabled={isVerifying}
              />

              <button 
                type="submit" 
                disabled={isVerifying}
                className={`w-full p-2 rounded-lg flex items-center justify-center gap-2 text-white transition-all duration-200 ${
                  isVerifying 
                    ? 'bg-gray-500 cursor-not-allowed' 
                    : isDarkMode 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {isVerifying ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Register;