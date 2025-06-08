import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Plans from './pages/Plans';
import AuthSuccess from './pages/AuthSuccess';
import LandingPage from './pages/LandingPage';

import ProtectedRoute from './components/ProtectedRoute';
import { ThemeProvider } from './context/ThemeContext';



function App() {
  return (
    <ThemeProvider>
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/success" element={<AuthSuccess />} />

          {/* protected route */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/plans" element={
            <ProtectedRoute>
              <Plans />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
    </ThemeProvider>
  );
}

export default App;