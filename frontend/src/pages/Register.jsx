import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext'; // Add this import

function Register() {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme(); // Replace useState with useTheme
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    avatar: null,
    password: ''
  });

  const handleChange = (e) => {
    if (e.target.name === "avatar") {
      setFormData({...formData, avatar: e.target.files[0]})
    } else {
      setFormData({...formData, [e.target.name]: e.target.value})
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append('username', formData.username);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('avatar', formData.avatar);
    formDataToSend.append('password', formData.password);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/v2/users/register",
        formDataToSend,
        {headers: { 'Content-Type': 'multipart/form-data' }}
      );

      if (response.data.statusCode === 200) {
        navigate('/dashboard');
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.log('Error: ', error);
    }
  }

  return (
    <div 
      className={`flex justify-center items-center min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}
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
        <div className={`w-1/2 p-12 pl-45 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}> {/* Added pl-24 for padding-left */}
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
            isDarkMode ? 'border-white' : 'border-gray-300'
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

          <form onSubmit={handleSubmit} className={`p-6 w-96 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
            <h2 className="text-2xl font-semibold text-center mb-4">Create Your Account</h2>
            
            {/* Form inputs */}
            <div className="space-y-4">
              <div>
                <label className="block mb-2">Username</label>
                <input 
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full p-2 rounded border ${
                    isDarkMode ? 'bg-gray-800 text-white border-gray-600 focus:border-blue-500' : 'bg-white text-gray-900 border-gray-300 focus:border-blue-500'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block mb-2">Email</label>
                <input 
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full p-2 rounded border ${
                    isDarkMode ? 'bg-gray-800 text-white border-gray-600 focus:border-blue-500' : 'bg-white text-gray-900 border-gray-300 focus:border-blue-500'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block mb-2">Avatar</label>
                <input 
                  type="file"
                  name="avatar"
                  onChange={handleChange}
                  className={`w-full p-2 rounded border ${
                    isDarkMode ? 'bg-gray-800 text-white border-gray-600 focus:border-blue-500' : 'bg-white text-gray-900 border-gray-300 focus:border-blue-500'
                  }`}
                  accept="image/*"
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
                    isDarkMode ? 'bg-gray-800 text-white border-gray-600 focus:border-blue-500' : 'bg-white text-gray-900 border-gray-300 focus:border-blue-500'
                  }`}
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
              Register
            </button>

            <div className="text-center mt-4">
              <p>Already have an account?</p>
              <button 
                type="button"
                className="text-blue-400 hover:underline"
                onClick={() => navigate('/login')}
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;