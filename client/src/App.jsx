import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import MoviesPage from './pages/MoviesPage';
import MovieDetailsPage from './pages/MovieDetailsPage';
import SeatSelectionPage from './pages/SeatSelectionPage';
import CheckoutPage from './pages/CheckoutPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import MyBookingsPage from './pages/MyBookingsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import { checkHealth } from './services/api';

function AppContent() {
  const [healthStatus, setHealthStatus] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  const verifySystemHealth = useCallback(async (notify = false) => {
    setIsChecking(true);
    try {
      const res = await checkHealth();
      setHealthStatus(res);

      if (notify) {
        if (res.online && res.data?.database?.connected) {
          toast.success('System Online: MongoDB Atlas connected successfully!');
        } else if (res.online) {
          toast.warning('Express API online, but MongoDB Atlas is not yet connected.');
        } else {
          toast.error('Unable to reach backend server at http://localhost:5000');
        }
      }
    } catch (err) {
      console.error('Health check exception:', err);
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    verifySystemHealth(false);
  }, [verifySystemHealth]);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar healthStatus={healthStatus} />

      <main className="flex-grow-1">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                healthStatus={healthStatus}
                onRefreshHealth={() => verifySystemHealth(true)}
                isChecking={isChecking}
              />
            }
          />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/movies/:id" element={<MovieDetailsPage />} />
          <Route path="/booking/seats/:showId" element={<SeatSelectionPage />} />
          <Route
            path="/checkout/:bookingId"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking/confirmation/:bookingId"
            element={
              <ProtectedRoute>
                <BookingConfirmationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
      <ToastContainer position="bottom-right" theme="dark" autoClose={4000} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
