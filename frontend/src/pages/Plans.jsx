import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Plans = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
      username: '',
      email: '',
      avatar: '',
      plan: 'basic' // Add plan to userData state
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleLogout = () => {
    if (!window.confirm('Are you sure you want to logout?')) {
      return;
    }
    localStorage.removeItem('accessToken');
    navigate('/login');
  };

  const fetchUserData = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/v2/users/profile', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.data?.success) {
        setUserData({
          username: response.data.data.username,
          email: response.data.data.email,
          avatar: response.data.data.avatar,
          plan: response.data.data.plan || 'basic' // Add plan data
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await axios.delete('http://localhost:8000/api/v2/users/delete-account', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.data?.success) {
        localStorage.removeItem('accessToken');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please try again.');
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handlePayment = async (planType) => {
    setLoading(true);
    setSelectedPlan(planType);

    try {
      const response = await axios.post(
        'http://localhost:8000/api/v2/users/create-payment',
        { planType },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      const { orderId, amount, currency, planType: responsePlanType } = response.data.data;

      const options = {
        key: 'rzp_test_oifQCL4ShUZK2e',
        amount: amount * 100,
        currency: currency,
        name: 'Meet Beater AI',
        description: `Payment for ${responsePlanType === 'monthly' ? 'Monthly' : 'Yearly'} Plan`,
        order_id: orderId,
        handler: function (response) {
          // Send response to backend to verify & update user
          axios.post('http://localhost:8000/api/v2/payments/verify-payment', {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            planType: responsePlanType,
          }, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          }).then(() => {
            alert(`${responsePlanType === 'monthly' ? 'Monthly' : 'Yearly'} Plan activated successfully!`);
            // Optionally redirect to dashboard
            navigate('/dashboard');
          }).catch((error) => {
            console.error('Payment verification error:', error);
            alert('Payment successful but verification failed. Please contact support.');
          });
        },
        theme: {
          color: '#1e90ff',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error.response || error);
      alert(
        error.response?.data?.message ||
        error.message ||
        'Payment failed. Please try again.'
      );
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  const plans = [
    {
      name: "Basic",
      price: "0$/month",
      features: [
        "✓ Up to 3 meeting summaries/month",
        "✓ Basic transcription",
        "✓ Email support"
      ],
      planType: "basic"
    },
    {
      name: "Monthly",
      price: "$5/month",
      features: [
        "✓ Up to 50 meeting summaries/month",
        "✓ Advanced AI summaries",
        "✓ Full searchable history",
        "✓ Priority support",
        "✓ PDF export"
      ],
      planType: "monthly"
    },
    {
      name: "Yearly",
      price: "$50/year",
      originalPrice: "$60/year",
      savings: "Save $10",
      features: [
        "✓ Unlimited meeting summaries",
        "✓ Advanced AI summaries",
        "✓ Full searchable history",
        "✓ Priority support",
        "✓ PDF export",
        "✓ Team collaboration (coming soon)"
      ],
      planType: "yearly"
    }
  ];

  useEffect(() => {
      const handleClickOutside = (event) => {
        if (isDropdownOpen && !event.target.closest('.relative')) {
          setIsDropdownOpen(false);
        }
      };
  
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isDropdownOpen]);

  return (
    <div className={`min-h-screen font-[Courier_New] ${isDarkMode ? 'bg-[#0a0a0a] text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Navigation Header */}
      <nav className={`${isDarkMode ? 'bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-gray-800' : 'bg-white'} shadow-lg sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              
            </h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="flex items-center space-x-6">
                  {/* User info */}
                  <div className="flex flex-col items-end">
                    <span className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>
                      {userData.username}
                    </span>
                  </div>
                  
                  {/* Plan Badge - lightning blue */}
                  <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                    userData.plan === 'basic' 
                      ? isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-500 text-white' : 'bg-gradient-to-r from-gray-500 to-gray-200 text-black'
                      : userData.plan === 'monthly'
                      ? isDarkMode ? 'bg-gradient-to-r from-purple-700 to-pink-700 text-white' : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : isDarkMode ? 'bg-gradient-to-r from-purple-700 to-pink-700 text-white' : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  }`}>
                    {userData.plan === 'basic' ? 'Basic Plan' : 
                     userData.plan === 'monthly' ? 'Pro Monthly' : 'Pro Yearly'}
                  </div>
                  
                  {userData.avatar ? (
                    <img
                      src={userData.avatar}
                      alt="User avatar"
                      className={`h-8 w-8 rounded-full ${isDarkMode ? ' ring-2 ring-[#00BFFF]/50' : ' ring-2 ring-white ring-opacity-20'}`}
                    />
                  ) : (
                    <div className={`h-8 w-8 rounded-full ${isDarkMode ? 'bg-[#00BFFF]' : 'bg-indigo-600'} flex items-center justify-center`}>
                      <span className="text-white text-sm font-semibold">
                        {userData.username ? userData.username[0].toUpperCase() : 'G'}
                      </span>
                    </div>
                  )}
                  
                  {/* Enhanced hamburger button */}
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex flex-col justify-center items-center w-6 h-6 focus:outline-none"
                  >
                    <div className="flex flex-col justify-between w-5 h-4">
                      <span 
                        className={`h-0.5 w-full transform transition-all duration-300 ease-in-out ${
                          isDarkMode ? 'bg-gray-300' : 'bg-gray-600'
                        } ${
                          isDropdownOpen 
                            ? 'rotate-45 translate-y-2' 
                            : ''
                        }`}
                      />
                      <span 
                        className={`h-0.5 w-full transform transition-all duration-300 ease-in-out ${
                          isDarkMode ? 'bg-gray-300' : 'bg-gray-600'
                        } ${
                          isDropdownOpen 
                            ? 'opacity-0' 
                            : 'opacity-100'
                        }`}
                      />
                      <span 
                        className={`h-0.5 w-full transform transition-all duration-300 ease-in-out ${
                          isDarkMode ? 'bg-gray-300' : 'bg-gray-600'
                        } ${
                          isDropdownOpen 
                            ? '-rotate-45 -translate-y-1.5' 
                            : ''
                        }`}
                      />
                    </div>
                  </button>
                </div>
                
                {/* Enhanced Dropdown Menu */}
                {isDropdownOpen && (
                  <div className={`absolute right-0 mt-2 w-48 ${
                    isDarkMode ? 'bg-gray-900/95 backdrop-blur-sm border border-gray-800' : 'bg-white'
                  } rounded-lg shadow-2xl py-1`}>
                    {/* Theme toggle */}
                    <div className={`px-4 py-2 flex items-center justify-between ${
                      isDarkMode 
                        ? 'text-gray-300 hover:bg-gray-800' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}>
                      <span className="text-sm">Lights</span>
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
                    
                    {/* Logout button */}
                    <button
                      onClick={handleLogout}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        isDarkMode 
                          ? 'text-gray-300 hover:bg-gray-800' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Logout
                    </button>

                    {/* Delete Account button */}
                    <button
                      onClick={handleDeleteAccount}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        isDarkMode 
                          ? 'text-red-400 hover:bg-gray-800' 
                          : 'text-red-600 hover:bg-gray-100'
                      }`}
                    >
                      Delete Account
                    </button>

                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Back Button */}
      <div className="fixed top-3 left-20 z-50">
        <button
          onClick={() => navigate('/dashboard')}
          className={`px-4 py-2 font-medium   transition-all duration-200 rounded-lg ${
            isDarkMode
              ? 'bg-gray-900/80 backdrop-blur-sm text-gray-300 border border-gray-800 hover:bg-gray-800 hover:text-white'
              : 'bg-gray-300 text-gray-900 hover:bg-gray-200'
          }`}
        >
          ← Dashboard
        </button>
      </div>

      <div className="max-w-7xl mx-auto text-center pt-20 px-4">
        <h1 className={`text-5xl font-semibold font-[Courier_New]  mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Choose Your Plan
        </h1>
        <p className={`text-lg   mb-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Flexible pricing for every team and budget
        </p>

        <div className="flex flex-wrap justify-center gap-8 lg:flex-nowrap">
          {plans.map((plan, index) => (
            <div
              key={index}
              onClick={() => setIsDropdownOpen(false)} // Add this line
              className={`flex-1 max-w-sm rounded-2xl shadow-lg p-8 border relative transform transition-all duration-300 flex flex-col   ${
                isDarkMode 
                  ? 'bg-gray-900/50 backdrop-blur-sm border-gray-800' 
                  : 'bg-white border-gray-200'
              } ${plan.planType === 'yearly' 
                ? isDarkMode 
                  ? ' ring-2 ring-[#1E90FF]/50 shadow-[#1E90FF]/20' 
                  : ' ring-2 ring-[#1E90FF]' 
                : ''
              } ${
                userData.plan === plan.planType 
                  ? isDarkMode 
                    ? ' ring-2 ring-[#00BFFF]/50 shadow-[#00BFFF]/20' 
                    : ' ring-2 ring-green-500' 
                  : ''
              }`}
            >
              {plan.savings && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold   ${
                    isDarkMode 
                      ? 'bg-[#1E90FF] text-white' 
                      : 'bg-green-500 text-white'
                  }`}>
                    {plan.savings}
                  </span>
                </div>
              )}
              
              {/* Current plan indicator */}
              {userData.plan === plan.planType && (
                <div className="absolute -top-3 right-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold   ${
                    isDarkMode 
                      ? 'bg-[#1e90ff] text-white'
                      : 'bg-green-500 text-white'
                  }`}>
                    Current Plan
                  </span>
                </div>
              )}
              
              <h2 className={`text-2xl font-semibold   mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {plan.name}
              </h2>
              <div className="mb-4">
                <p className={`text-xl font-bold   ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {plan.price}
                </p>
                {plan.originalPrice && (
                  <p className={`text-sm line-through   ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    {plan.originalPrice}
                  </p>
                )}
              </div>
              
              <ul className={`mb-6 space-y-2 text-left flex-grow   ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="text-sm  ">{feature}</li>
                ))}
              </ul>
              
              <button
                onClick={() => plan.planType !== 'basic' && userData.plan !== plan.planType ? handlePayment(plan.planType) : undefined}
                disabled={plan.planType === 'basic' || userData.plan === plan.planType || (loading && selectedPlan === plan.planType)}
                className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 font-semibold   transition-all duration-300 mt-auto ${
                  userData.plan === plan.planType
                    ? isDarkMode 
                      ? 'bg-[#1e90ff] text-white cursor-default'
                      : 'bg-green-500 text-white cursor-default'
                    : plan.planType === 'basic' 
                    ? isDarkMode 
                      ? 'bg-gray-800 border border-gray-700 text-gray-500 cursor-not-allowed' 
                      : 'bg-gray-400 text-white cursor-not-allowed'
                    : plan.planType === 'yearly'
                    ? isDarkMode 
                      ? 'bg-[#1e90ff] text-white hover:bg-[#5141e1]' 
                      : 'bg-[#1e90ff] text-white hover:bg-[#5141e1]'
                    : isDarkMode 
                    ? 'bg-[#1e90ff] text-white hover:bg-[#5141e1]' 
                    : 'bg-[#1e90ff] text-white hover:bg-[#5141e1]'
                } ${loading && selectedPlan === plan.planType ? 'opacity-50' : ''}`}
              >
                {loading && selectedPlan === plan.planType ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    <span className=" ">Processing...</span>
                  </>
                ) : userData.plan === plan.planType ? (
                  '✓ Active Plan'
                ) : (
                  plan.planType === 'basic' ? 'Downgrade' : 'Get Started'
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Plans;