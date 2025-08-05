const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  title: {
    type: String,
    required: true,
    default: 'Meeting'
  },
  description: {
    type: String,
    default: ''
  },
  meetingType: {
    type: String,
    enum: ['online', 'offline'],
    required: true
  },
  attendees: [{
    email: {
      type: String,
      required: true
    },
    name: String,
    responseStatus: {
      type: String,
      enum: ['needsAction', 'accepted', 'declined', 'tentative'],
      default: 'needsAction'
    }
  }],
  // Online meeting fields
  meetingPlatform: {
    type: String,
    enum: ['zoom', 'teams', 'google-meet', 'zoho'],
    required: function() { return this.meetingType === 'online'; }
  },
  meetingLink: {
    type: String
  },
  // Offline meeting fields
  location: {
    address: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    googleMapsLink: String
  },
  adminCalendarEventId: {
    type: String
  },
  userCalendarEventId: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  notes: {
    type: String
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for faster queries
bookingSchema.index({ user: 1, startTime: 1 });
bookingSchema.index({ startTime: 1, endTime: 1 });
bookingSchema.index({ status: 1 });

// Update the updatedAt field before saving
bookingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Booking', bookingSchema); 