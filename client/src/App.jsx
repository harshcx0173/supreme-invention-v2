import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Dashboard from './pages/Dashboard.jsx';
import BookingForm from './pages/BookingForm.jsx';
import MyBookings from './pages/MyBookings.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import UserManagement from './pages/UserManagement.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import Test from './pages/test.jsx';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/dashboard"
            element={user ? <Dashboard /> : <Navigate to="/" />}
          />
          <Route
            path="/book"
            element={user ? <BookingForm /> : <Navigate to="/" />}
          />
          <Route
            path="/my-bookings"
            element={user ? <MyBookings /> : <Navigate to="/" />}
          />
          <Route
            path="/admin"
            element={user?.isAdmin ? <AdminDashboard /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/admin/users"
            element={user?.isSuperAdmin ? <UserManagement /> : <Navigate to="/dashboard" />}
          />
          <Route path="/test" element={<Test />} />
        </Routes>
      </main>
    </div>
  );
}

export default App; 