const express = require('express');
const { body, validationResult } = require('express-validator');
const moment = require('moment');
const router = express.Router();

const Booking = require('../models/Booking');
const User = require('../models/User');
const googleCalendarService = require('../utils/googleCalendar');
const emailService = require('../utils/emailService');
const meetingPlatformService = require('../utils/meetingPlatformService');
const azureMapsService = require('../utils/azureMapsService');

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Helper function to generate calendar event description
const generateCalendarDescription = (description, meetingType, meetingPlatform, location) => {
  let desc = description || '';
  
  if (meetingType === 'online') {
    const platformNames = {
      'zoom': 'Zoom',
      'teams': 'Microsoft Teams',
      'google-meet': 'Google Meet',
      'zoho': 'Zoho Meeting'
    };
    desc += `\n\nMeeting Type: Online (${platformNames[meetingPlatform]})`;
  } else if (meetingType === 'offline' && location) {
    const address = [
      location.address,
      location.city,
      location.state,
      location.postalCode,
      location.country
    ].filter(Boolean).join(', ');
    
    desc += `\n\nMeeting Type: In-Person\nLocation: ${address}`;
    
    if (location.googleMapsLink) {
      desc += `\nMaps: ${location.googleMapsLink}`;
    }
  }
  
  return desc;
};

// Create a new booking
router.post('/', requireAuth, [
  body('startTime').isISO8601().withMessage('Valid start time is required'),
  body('endTime').isISO8601().withMessage('Valid end time is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('description').optional().isString(),
  body('meetingType').isIn(['online', 'offline']).withMessage('Meeting type must be online or offline'),
  body('attendees').isArray().withMessage('Attendees must be an array'),
  body('attendees.*.email').isEmail().withMessage('Valid email is required for each attendee'),
  body('meetingPlatform').optional().custom((value, { req }) => {
    if (req.body.meetingType === 'online' && !value) {
      throw new Error('Meeting platform is required for online meetings');
    }
    if (value && !['zoom', 'teams', 'google-meet', 'zoho'].includes(value)) {
      throw new Error('Invalid meeting platform');
    }
    return true;
  }),
  body('location').optional().isObject().withMessage('Location must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      startTime, 
      endTime, 
      title, 
      description, 
      meetingType, 
      attendees, 
      meetingPlatform, 
      location 
    } = req.body;
    const start = moment(startTime);
    const end = moment(endTime);

    // Validate time range
    if (start.isAfter(end)) {
      return res.status(400).json({ error: 'Start time must be before end time' });
    }

    if (start.isBefore(moment())) {
      return res.status(400).json({ error: 'Cannot book appointments in the past' });
    }

    // Check if slot is already booked in our database
    const existingBooking = await Booking.findOne({
      startTime: { $lt: end.toDate() },
      endTime: { $gt: start.toDate() },
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingBooking) {
      return res.status(409).json({ error: 'This time slot is already booked' });
    }

    // Get admin user
    const adminUser = await User.findOne({ isAdmin: true });
    if (!adminUser) {
      return res.status(500).json({ error: 'Admin user not found' });
    }

    // Create OAuth2 client for admin
    const adminAuth = googleCalendarService.createOAuth2Client(
      adminUser.accessToken,
      adminUser.refreshToken
    );

    // Check availability in admin's Google Calendar
    const isAvailable = await googleCalendarService.checkAvailability(
      adminAuth,
      start.toDate(),
      end.toDate(),
      process.env.ADMIN_CALENDAR_ID || 'primary'
    );

    if (!isAvailable) {
      return res.status(409).json({ error: 'This time slot is not available in the calendar' });
    }

    // Handle meeting type specific logic
    let meetingLink = null;
    let validatedLocation = null;

    console.log('Processing meeting type:', meetingType);

    if (meetingType === 'online') {
      // Validate meeting platform
      if (!meetingPlatform) {
        return res.status(400).json({ error: 'Meeting platform is required for online meetings' });
      }

      console.log('Generating meeting link for platform:', meetingPlatform);
      // Generate meeting link
      const meetingDetails = {
        title,
        startTime: start.toDate(),
        endTime: end.toDate(),
        attendees: attendees.map(a => a.email)
      };

      const platformResult = await meetingPlatformService.generateMeetingLink(meetingPlatform, meetingDetails);
      meetingLink = platformResult.link;
      console.log('Meeting link generated:', meetingLink);
    } else if (meetingType === 'offline') {
      // Validate location
      if (!location || !location.address) {
        return res.status(400).json({ error: 'Location is required for offline meetings' });
      }

      console.log('Validating location:', location);
      // Validate and geocode location
      validatedLocation = await azureMapsService.validateLocation(location);
      console.log('Location validated:', validatedLocation);
    }

    // Create OAuth2 client for user
    const userAuth = googleCalendarService.createOAuth2Client(
      req.user.accessToken,
      req.user.refreshToken
    );

    // Prepare attendees for calendar events
    const calendarAttendees = [
      { email: req.user.email },
      { email: adminUser.email },
      ...attendees.map(a => ({ email: a.email }))
    ];

    // Create event in admin's calendar
    const adminEventData = {
      title: `${title} - ${req.user.name}`,
      description: generateCalendarDescription(description, meetingType, meetingPlatform, validatedLocation),
      startTime: start.toDate(),
      endTime: end.toDate(),
      attendees: calendarAttendees
    };

    console.log('Creating admin calendar event:', adminEventData);
    const adminEvent = await googleCalendarService.createEvent(
      adminAuth,
      adminEventData,
      process.env.ADMIN_CALENDAR_ID || 'primary'
    );
    console.log('Admin event created:', adminEvent.id);

    // Create event in user's calendar
    const userEventData = {
      title: title,
      description: generateCalendarDescription(description, meetingType, meetingPlatform, validatedLocation),
      startTime: start.toDate(),
      endTime: end.toDate(),
      attendees: calendarAttendees
    };

    console.log('Creating user calendar event:', userEventData);
    const userEvent = await googleCalendarService.createEvent(
      userAuth,
      userEventData,
      'primary'
    );
    console.log('User event created:', userEvent.id);

    // Save booking to database
    const booking = new Booking({
      user: req.user._id,
      startTime: start.toDate(),
      endTime: end.toDate(),
      title,
      description,
      meetingType,
      attendees: attendees.map(a => ({
        email: a.email,
        name: a.name || '',
        responseStatus: 'needsAction'
      })),
      meetingPlatform: meetingType === 'online' ? meetingPlatform : undefined,
      meetingLink: meetingLink,
      location: validatedLocation,
      adminCalendarEventId: adminEvent.id,
      userCalendarEventId: userEvent.id,
      status: 'confirmed'
    });

    await booking.save();

    // Send email invitations
    try {
      if (meetingType === 'online') {
        await emailService.sendOnlineMeetingInvitation(booking, attendees);
      } else {
        await emailService.sendOfflineMeetingInvitation(booking, attendees);
      }
      
      booking.emailSent = true;
      await booking.save();
      console.log('Email invitations sent successfully');
    } catch (emailError) {
      console.error('Error sending email invitations:', emailError);
      console.warn('Email sending failed, but booking was created successfully');
      // Don't fail the booking creation if email fails
    }

    res.status(201).json({
      message: 'Booking created successfully',
      booking: {
        id: booking._id,
        startTime: booking.startTime,
        endTime: booking.endTime,
        title: booking.title,
        status: booking.status,
        meetingType: booking.meetingType,
        meetingLink: booking.meetingLink,
        attendees: booking.attendees
      }
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to create booking',
      details: error.message  
    });
  }
});

// Get available meeting platforms
router.get('/platforms', requireAuth, async (req, res) => {
  try {
    const platforms = meetingPlatformService.getAvailablePlatforms();
    res.json(platforms);
  } catch (error) {
    console.error('Error getting meeting platforms:', error);
    res.status(500).json({ error: 'Failed to get meeting platforms' });
  }
});

// Get user's bookings
router.get('/my-bookings', requireAuth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .sort({ startTime: 1 })
      .populate('user', 'name email');

    res.json(bookings);
  } catch (error) {
    console.error('Error getting user bookings:', error);
    res.status(500).json({ error: 'Failed to get bookings' });
  }
});

// Get all bookings (admin only)
router.get('/', requireAuth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { status, startDate, endDate } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (startDate && endDate) {
      filter.startTime = {
        $gte: moment(startDate).startOf('day').toDate(),
        $lte: moment(endDate).endOf('day').toDate()
      };
    }

    const bookings = await Booking.find(filter)
      .sort({ startTime: 1 })
      .populate('user', 'name email');

    res.json(bookings);
  } catch (error) {
    console.error('Error getting all bookings:', error);
    res.status(500).json({ error: 'Failed to get bookings' });
  }
});

// Get specific booking
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if user has access to this booking
    if (!req.user.isAdmin && booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Error getting booking:', error);
    res.status(500).json({ error: 'Failed to get booking' });
  }
});

// Update booking status
router.patch('/:id/status', requireAuth, [
  body('status').isIn(['pending', 'confirmed', 'cancelled']).withMessage('Valid status is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    booking.status = status;
    await booking.save();

    res.json({ message: 'Booking status updated', booking });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

// Cancel booking
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if user has permission to cancel
    if (!req.user.isAdmin && booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete events from Google Calendar
    if (booking.adminCalendarEventId) {
      const adminUser = await User.findOne({ isAdmin: true });
      if (adminUser) {
        const adminAuth = googleCalendarService.createOAuth2Client(
          adminUser.accessToken,
          adminUser.refreshToken
        );
        await googleCalendarService.deleteEvent(
          adminAuth,
          booking.adminCalendarEventId,
          process.env.ADMIN_CALENDAR_ID || 'primary'
        );
      }
    }

    if (booking.userCalendarEventId) {
      const userAuth = googleCalendarService.createOAuth2Client(
        req.user.accessToken,
        req.user.refreshToken
      );
      await googleCalendarService.deleteEvent(
        userAuth,
        booking.userCalendarEventId,
        'primary'
      );
    }

    // Update booking status
    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

module.exports = router; 