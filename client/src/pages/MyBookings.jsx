import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Calendar, 
  Clock, 
  Trash2, 
  ExternalLink, 
  Filter, 
  Video, 
  MapPin, 
  Users, 
  Mail 
} from 'lucide-react';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get('/api/bookings/my-bookings');
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await axios.delete(`/api/bookings/${bookingId}`);
      toast.success('Booking cancelled successfully');
      fetchBookings(); // Refresh the list
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') {
      return new Date(booking.startTime) > new Date() && booking.status === 'confirmed';
    }
    if (filter === 'past') {
      return new Date(booking.startTime) < new Date() || booking.status === 'cancelled';
    }
    return booking.status === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
        <p className="text-gray-600">
          View and manage all your meeting bookings
        </p>
      </div>

      {/* Filter Controls */}
      <div className="card mb-6">
        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          <div className="flex space-x-2">
            {[
              { value: 'all', label: 'All' },
              { value: 'upcoming', label: 'Upcoming' },
              { value: 'past', label: 'Past' },
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'cancelled', label: 'Cancelled' }
            ].map((filterOption) => (
              <button
                key={filterOption.value}
                onClick={() => setFilter(filterOption.value)}
                className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                  filter === filterOption.value
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="card text-center py-12">
          <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'all' ? 'No bookings found' : `No ${filter} bookings`}
          </h3>
          <p className="text-gray-500 mb-4">
            {filter === 'all' 
              ? 'You haven\'t made any bookings yet.' 
              : `You don't have any ${filter} bookings.`
            }
          </p>
          {filter === 'all' && (
            <a
              href="/book"
              className="btn btn-primary"
            >
              Book Your First Meeting
            </a>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const { date, time } = formatDateTime(booking.startTime);
            const isUpcoming = new Date(booking.startTime) > new Date();
            const canCancel = isUpcoming && booking.status === 'confirmed';

            return (
              <div
                key={booking._id}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {date}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {time}
                      </div>
                    </div>

                    {booking.description && (
                      <p className="text-gray-600 mb-3">
                        {booking.description}
                      </p>
                    )}

                    {/* Meeting Type and Details */}
                    <div className="flex items-center space-x-4 mb-3 text-sm">
                      <div className="flex items-center">
                        {booking.meetingType === 'online' ? (
                          <Video className="h-4 w-4 mr-1 text-blue-600" />
                        ) : (
                          <MapPin className="h-4 w-4 mr-1 text-green-600" />
                        )}
                        <span className="font-medium">
                          {booking.meetingType === 'online' ? 'Online' : 'In-Person'}
                        </span>
                      </div>
                      
                      {booking.meetingType === 'online' && booking.meetingPlatform && (
                        <span className="text-gray-600">
                          via {booking.meetingPlatform.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      )}
                    </div>

                    {/* Attendees */}
                    {booking.attendees && booking.attendees.length > 0 && (
                      <div className="flex items-center mb-3 text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{booking.attendees.length} attendee(s)</span>
                      </div>
                    )}

                    {/* Location for offline meetings */}
                    {booking.meetingType === 'offline' && booking.location && (
                      <div className="flex items-start mb-3 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">{booking.location.address}</p>
                          {booking.location.city && (
                            <p>{booking.location.city}, {booking.location.state} {booking.location.postalCode}</p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      Created: {new Date(booking.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {booking.meetingLink && (
                      <a
                        href={booking.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Join Meeting"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    
                    {canCancel && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Cancel Booking"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary */}
      {bookings.length > 0 && (
        <div className="mt-8 text-center text-sm text-gray-500">
          Showing {filteredBookings.length} of {bookings.length} total bookings
        </div>
      )}
    </div>
  );
};

export default MyBookings; 