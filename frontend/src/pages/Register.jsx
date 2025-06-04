import { useState } from 'react';
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
    setIsVerifying(true); // Start verification loading
    
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
      setIsVerifying(false); // Stop verification loading
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