import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Calendar, Clock, Users, CheckCircle } from 'lucide-react';

const Home = () => {
  const { user, login } = useAuth();

  const features = [
    {
      icon: Calendar,
      title: 'Easy Scheduling',
      description: 'Book meetings with just a few clicks using our intuitive interface.'
    },
    {
      icon: Clock,
      title: 'Real-time Availability',
      description: 'See available time slots in real-time and book instantly.'
    },
    {
      icon: Users,
      title: 'Google Calendar Integration',
      description: 'Seamlessly sync with your Google Calendar for automatic event creation.'
    },
    {
      icon: CheckCircle,
      title: 'Smart Validation',
      description: 'Our system validates availability before confirming your booking.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-16">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Book Meetings with
          <span className="text-primary-600"> Ease</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Streamline your meeting scheduling process with our integrated Google Calendar solution. 
          Book appointments, manage availability, and never double-book again.
        </p>
        
        {user ? (
          <div className="space-y-4">
            <p className="text-lg text-gray-700">
              Welcome back, <span className="font-semibold">{user.name}</span>!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/book"
                className="btn btn-primary text-lg px-8 py-3"
              >
                Book a Meeting
              </Link>
              <Link
                to="/dashboard"
                className="btn btn-secondary text-lg px-8 py-3"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={login}
              className="btn btn-primary text-lg px-8 py-3"
            >
              Sign in with Google
            </button>
            <p className="text-sm text-gray-500">
              Get started by signing in with your Google account
            </p>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Why Choose Our Platform?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                  <Icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* How it Works Section */}
      <div className="py-16 bg-white rounded-lg shadow-sm">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-600 text-white rounded-full text-xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Sign In
              </h3>
              <p className="text-gray-600">
                Sign in with your Google account to access the booking system.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-600 text-white rounded-full text-xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Select Time
              </h3>
              <p className="text-gray-600">
                Choose from available time slots that work for your schedule.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-600 text-white rounded-full text-xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Confirm Booking
              </h3>
              <p className="text-gray-600">
                Confirm your booking and get events added to both calendars automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 