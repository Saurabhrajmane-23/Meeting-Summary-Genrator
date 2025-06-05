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
          avatar: response.data.data.avatar
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
          color: '#291145',
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
      price: "Free",
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
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Navigation Header */}
      <nav className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className={`text-2xl ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              
            </h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="flex items-center space-x-6">
                  <span className={`text-2xl  ${isDarkMode ? 'text-white bg-gray-800' : 'text-black bg-white'}`}>
                    {userData.username}
                  </span>
                  {userData.avatar ? (
                    <img
                      src={userData.avatar}
                      alt="User avatar"
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                      <span className="text-white text-sm">
                        {userData.username ? userData.username[0].toUpperCase() : 'U'}
                      </span>
                    </div>
                  )}
                  {/* Replace the existing dropdown button and svg with this new animated version */}
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex flex-col justify-center items-center w-6 h-6 focus:outline-none"
                  >
                    <div className="flex flex-col justify-between w-5 h-4">
                      <span 
                        className={`h-0.5 w-full transform transition-all duration-300 ease-in-out ${
                          isDarkMode ? 'bg-white' : 'bg-gray-600'
                        } ${
                          isDropdownOpen 
                            ? 'rotate-45 translate-y-2' 
                            : ''
                        }`}
                      />
                      <span 
                        className={`h-0.5 w-full transform transition-all duration-300 ease-in-out ${
                          isDarkMode ? 'bg-white' : 'bg-gray-600'
                        } ${
                          isDropdownOpen 
                            ? 'opacity-0' 
                            : 'opacity-100'
                        }`}
                      />
                      <span 
                        className={`h-0.5 w-full transform transition-all duration-300 ease-in-out ${
                          isDarkMode ? 'bg-white' : 'bg-gray-600'
                        } ${
                          isDropdownOpen 
                            ? '-rotate-45 -translate-y-1.5' 
                            : ''
                        }`}
                      />
                    </div>
                  </button>
                </div>
                
                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className={`absolute right-0 mt-2 w-48 ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                  } rounded-sm shadow-lg py-1`}>
                    {/* Theme toggle */}
                    <div className={`px-4 py-2 flex items-center justify-between ${
                      isDarkMode 
                        ? 'text-gray-200 hover:bg-gray-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}>
                      <span className="text-sm">Lights</span>
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
                    
                    {/* Logout button */}
                    <button
                      onClick={handleLogout}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        isDarkMode 
                          ? 'text-gray-200 hover:bg-gray-700' 
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
                          ? 'text-red-400 hover:bg-gray-700' 
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
          className={`px-4 py-2 font-medium transition ${
            isDarkMode
              ? 'bg-gray-800 text-white border-white hover:bg-gray-700'
              : 'bg-gray-100 text-gray-900 border-gray-600 hover:bg-gray-200'
          }`}
        >
          ← Dashboard
        </button>
      </div>

      

      <div className="max-w-6xl mx-auto text-center top-20 py-15">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-lg mb-12">Flexible pricing for every team and budget.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-2xl shadow-lg p-8 border relative ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
              } ${plan.planType === 'yearly' ? 'ring-2 ring-blue-500' : ''}`}
            >
              {plan.savings && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {plan.savings}
                  </span>
                </div>
              )}
              
              <h2 className="text-2xl font-semibold mb-2">{plan.name}</h2>
              <div className="mb-4">
                <p className="text-xl font-bold">{plan.price}</p>
                {plan.originalPrice && (
                  <p className="text-sm text-gray-500 line-through">{plan.originalPrice}</p>
                )}
              </div>
              
              <ul className="mb-6 space-y-2 text-left">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="text-sm">{feature}</li>
                ))}
              </ul>
              
              <button
                onClick={() => plan.planType !== 'basic' ? handlePayment(plan.planType) : undefined}
                disabled={plan.planType === 'basic' || (loading && selectedPlan === plan.planType)}
                className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 font-semibold transition-colors ${
                  plan.planType === 'basic' 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : plan.planType === 'yearly'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                    : isDarkMode 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                } ${loading && selectedPlan === plan.planType ? 'opacity-50' : ''}`}
              >
                {loading && selectedPlan === plan.planType ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  plan.planType === 'basic' ? 'Current Plan' : 'Get Started'
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