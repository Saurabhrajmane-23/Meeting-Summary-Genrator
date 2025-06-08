import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

function LandingPage() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({ meetings: 0, hours: 0, teams: 0 });

  // Animated counter effect
  useEffect(() => {
    const timer = setTimeout(() => {
      const finalStats = { meetings: 50000, hours: 200000, teams: 5000 };
      let current = { meetings: 0, hours: 0, teams: 0 };
      
      const increment = setInterval(() => {
        current.meetings = Math.min(current.meetings + 500, finalStats.meetings);
        current.hours = Math.min(current.hours + 2000, finalStats.hours);
        current.teams = Math.min(current.teams + 50, finalStats.teams);
        
        setAnimatedStats({ ...current });
        
        if (current.meetings >= finalStats.meetings) {
          clearInterval(increment);
        }
      }, 50);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`min-h-screen font-[Arial] transition-all duration-300 ${
      isDarkMode ? 'bg-[#0a0a0a] text-white' : 'bg-white text-gray-900'
    }`}>
      
      {/* Navigation */}
      <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isDarkMode ? 'bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-gray-800' : 'bg-white/95 backdrop-blur-sm border-b border-gray-200'
      } shadow-lg`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img src="/images/logo.png" alt="Quill AI" className="w-8 h-8 rounded-lg" />
              <span className="text-xl font-bold">Quill AI</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="hover:text-blue-500 transition-colors">Features</a>
              <a href="#pricing" className="hover:text-blue-500 transition-colors">Pricing</a>
              <a href="#testimonials" className="hover:text-blue-500 transition-colors">Reviews</a>
              <Link to="/login" className="hover:text-blue-500 transition-colors">Login</Link>
              <Link to="/register" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all transform hover:scale-105">
                Get Started
              </Link>
            </div>

            {/* Dark Mode Toggle */}
            <div className="flex items-center space-x-4">
              <div className={`p-2 flex items-center gap-3 border rounded-lg ${
                isDarkMode ? 'border-gray-700' : 'border-gray-300'
              }`}>
                <span className="text-sm font-medium">Lights</span>
                <button
                  onClick={toggleDarkMode}
                  className={`relative w-10 h-4 rounded-full transition-colors duration-200 ${
                    !isDarkMode ? 'bg-[#1e90ff]' : 'bg-gray-600'
                  }`}
                >
                  <div className={`absolute top-0 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                    !isDarkMode ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className={`md:hidden py-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded-lg mt-2`}>
              <div className="flex flex-col space-y-4 px-4">
                <a href="#features" className="hover:text-blue-500 transition-colors">Features</a>
                <a href="#pricing" className="hover:text-blue-500 transition-colors">Pricing</a>
                <a href="#testimonials" className="hover:text-blue-500 transition-colors">Reviews</a>
                <Link to="/login" className="hover:text-blue-500 transition-colors">Login</Link>
                <Link to="/register" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full font-semibold text-center">
                  Get Started
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-blue-500/20 mb-6">
              <span className="text-sm font-medium text-blue-500">🚀 AI-Powered Meeting Intelligence</span>
            </div>
            
            <h1 className={`text-4xl md:text-6xl font-bold mb-6 leading-tight ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Stop Wasting Time in{' '}
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Pointless Meetings
              </span>
            </h1>
            
            <p className={`text-xl md:text-2xl mb-8 max-w-3xl mx-auto ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Turn your audio/video meetings into actionable insights with AI. Get instant summaries, extract key decisions, and never miss important action items again.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link to="/register" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl transition-all transform hover:scale-105 flex items-center space-x-2">
                <span>Start Free Trial</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              {/* <button className={`px-8 py-4 rounded-full font-bold text-lg border-2 transition-all hover:shadow-lg ${
                isDarkMode 
                  ? 'border-gray-600 text-white hover:bg-gray-800' 
                  : 'border-gray-300 text-gray-900 hover:bg-gray-50'
              }`}>
                Watch Demo
              </button> */}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500">{animatedStats.meetings.toLocaleString()}+</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Meetings Processed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-500">{animatedStats.hours.toLocaleString()}+</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Hours Saved</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500">{animatedStats.teams.toLocaleString()}+</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Happy Teams</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={`py-16 px-4 sm:px-6 lg:px-8 ${
        isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'
      }`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Teams Choose <span className="text-blue-500">Quill AI</span>
            </h2>
            <p className={`text-xl max-w-2xl mx-auto ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Cut through the meeting chaos with AI that actually understands what matters
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className={`p-8 rounded-2xl border transition-all hover:shadow-2xl hover:scale-102 ${
              isDarkMode 
                ? 'bg-gray-800/50 border-gray-700 hover:border-green-500' 
                : 'bg-white border-gray-200 hover:border-green-500'
            }`}>
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Instant AI Summaries</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Get concise, actionable summaries within seconds. No more scrolling through hour-long recordings.
              </p>
            </div>

            {/* Feature 2 */}
            <div className={`p-8 rounded-2xl border transition-all hover:shadow-2xl hover:scale-102 ${
              isDarkMode 
                ? 'bg-gray-800/50 border-gray-700 hover:border-green-500' 
                : 'bg-white border-gray-200 hover:border-green-500'
            }`}>
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Smart Action Tracking</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Never drop the ball again. AI extracts and tracks every action item with deadlines and owners.
              </p>
            </div>

            {/* Feature 3 */}
            <div className={`p-8 rounded-2xl border transition-all hover:shadow-2xl hover:scale-102 ${
              isDarkMode 
                ? 'bg-gray-800/50 border-gray-700 hover:border-green-500' 
                : 'bg-white border-gray-200 hover:border-green-500'
            }`}>
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Searchable History</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Find any discussion, decision, or detail from months ago in seconds. Your meeting memory, enhanced.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple Pricing That <span className="text-blue-500">Makes Sense</span>
            </h2>
            <p className={`text-xl max-w-2xl mx-auto ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Start free, upgrade when you're ready to unlock your team's full potential
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className={`p-8 rounded-2xl border-2 transition-all hover:shadow-2xl ${
              isDarkMode 
                ? 'bg-gray-800/50 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Basic</h3>
                <div className="text-4xl font-bold mb-4">$0<span className="text-lg font-normal"> / month</span></div>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Perfect for getting started</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>3 meetings per month</span>
                </li>
                <li className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Basic AI summaries</span>
                </li>
                <li className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Action item extraction</span>
                </li>
              </ul>
              <Link to="/register" className={`w-full mt-29 py-3 px-6 rounded-xl font-semibold text-center block transition-all ${
                isDarkMode 
                  ? 'bg-gray-700 text-white hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}>
                Get Started Free
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="p-8 rounded-2xl border-2 border-blue-500 bg-gradient-to-b from-blue-500/5 to-purple-600/5 transition-all hover:shadow-2xl relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Pro</h3>
                <div className="text-4xl font-bold mb-4">$5<span className="text-lg font-normal"> / month</span></div>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>For serious productivity gains</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Unlimited meetings</span>
                </li>
                <li className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Advanced AI summaries</span>
                </li>
                <li className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Full searchable history</span>
                </li>
                <li className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Priority support</span>
                </li>
                <li className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>PDF export</span>
                </li>
              </ul>
              <Link to="/register" className="w-full py-3 px-6 rounded-xl font-semibold text-center block bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-xl transition-all transform hover:scale-105">
                Start Pro Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className={`py-16 px-4 sm:px-6 lg:px-8 ${
        isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'
      }`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Loved by <span className="text-blue-500">Productive Teams</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className={`p-6 rounded-2xl border ${
              isDarkMode 
                ? 'bg-gray-800/50 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center mb-4">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                "Game changer for our remote team. We actually know what was decided in meetings now!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  S
                </div>
                <div className="ml-3">
                  <div className="font-semibold">Sarah Chen</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Product Manager</div>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-2xl border ${
              isDarkMode 
                ? 'bg-gray-800/50 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center mb-4">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                "Saves me 2+ hours every week. The AI summaries are surprisingly accurate and actionable."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  M
                </div>
                <div className="ml-3">
                  <div className="font-semibold">Marcus Rodriguez</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Startup Founder</div>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-2xl border ${
              isDarkMode 
                ? 'bg-gray-800/50 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center mb-4">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                "Finally, a tool that makes meetings productive instead of painful. Love the action item tracking!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                  A
                </div>
                <div className="ml-3">
                  <div className="font-semibold">Alex Thompson</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Freelance Consultant</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your <span className="text-blue-500">Meeting Game?</span>
          </h2>
          <p className={`text-xl mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Join thousands of teams who've already said goodbye to meeting chaos
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/register" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl transition-all transform hover:scale-105 flex items-center space-x-2">
              <span>Start Your Free Trial</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No credit card required • 3 free meetings included
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 px-4 sm:px-6 lg:px-8 border-t ${
        isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img src="/images/logo.png" alt="Quill AI" className="w-8 h-8 rounded-lg" />
                <span className="text-xl font-bold">Quill AI</span>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Where Clarity Cuts Through the Chatter
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <li><a href="#features" className="hover:text-blue-500 transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-blue-500 transition-colors">Pricing</a></li>
                <li><Link to="/plans" className="hover:text-blue-500 transition-colors">Plans</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">My Contacts</h4>
              <ul className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <li><a href="https://github.com/Saurabhrajmane-23" className="hover:text-blue-500 transition-colors" target='_blank'>Github</a></li>
                <li><a href="https://www.instagram.com/saurabh.r23/" className="hover:text-blue-500 transition-colors" target='_blank'>Instagram</a></li>
                <li><a href="https://x.com/Saurabh_e3" className="hover:text-blue-500 transition-colors" target='_blank'>X</a></li>
              </ul>
            </div>
            
            {/* <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Privacy</a></li>
              </ul>
            </div> */}
          </div>
          
          <div className={`mt-8 pt-8 border-t text-center text-sm ${
            isDarkMode ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-600'
          }`}>
            <p>&copy; 2025 Quill AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;