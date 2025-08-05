const { google } = require('googleapis');
const moment = require('moment');

class GoogleCalendarService {
  constructor() {
    this.calendar = google.calendar('v3');
  }

  // Create OAuth2 client
  createOAuth2Client(accessToken, refreshToken) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    });

    return oauth2Client;
  }

  // Check if a time slot is available
  async checkAvailability(auth, startTime, endTime, calendarId = 'primary') {
    try {
      const response = await this.calendar.events.list({
        auth,
        calendarId,
        timeMin: startTime.toISOString(),
        timeMax: endTime.toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
      });

      return response.data.items.length === 0;
    } catch (error) {
      console.error('Error checking calendar availability:', error);
      throw new Error('Failed to check calendar availability');
    }
  }

  // Create calendar event
  async createEvent(auth, eventData, calendarId = 'primary') {
    try {
      const event = {
        summary: eventData.title,
        description: eventData.description,
        start: {
          dateTime: eventData.startTime.toISOString(),
          timeZone: 'UTC'
        },
        end: {
          dateTime: eventData.endTime.toISOString(),
          timeZone: 'UTC'
        },
        attendees: eventData.attendees || [],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 10 }
          ]
        }
      };

      const response = await this.calendar.events.insert({
        auth,
        calendarId,
        resource: event,
        sendUpdates: 'all'
      });

      return response.data;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw new Error('Failed to create calendar event');
    }
  }

  // Delete calendar event
  async deleteEvent(auth, eventId, calendarId = 'primary') {
    try {
      await this.calendar.events.delete({
        auth,
        calendarId,
        eventId,
        sendUpdates: 'all'
      });
      return true;
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw new Error('Failed to delete calendar event');
    }
  }

  // Get available time slots for a specific date
  async getAvailableSlots(auth, date, duration = 30, calendarId = 'primary') {
    try {
      const startOfDay = moment(date).startOf('day');
      const endOfDay = moment(date).endOf('day');
      const now = moment();
      
      // Get existing events for the day
      const response = await this.calendar.events.list({
        auth,
        calendarId,
        timeMin: startOfDay.toISOString(),
        timeMax: endOfDay.toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
      });

      const busySlots = response.data.items.map(event => ({
        start: moment(event.start.dateTime || event.start.date),
        end: moment(event.end.dateTime || event.end.date)
      }));

      // Generate all possible slots
      const availableStartTime = process.env.AVAILABLE_START_TIME || '09:00';
      const availableEndTime = process.env.AVAILABLE_END_TIME || '17:00';
      
      const [startHour, startMinute] = availableStartTime.split(':').map(Number);
      const [endHour, endMinute] = availableEndTime.split(':').map(Number);
      
      let slotStart = startOfDay.clone().add(startHour, 'hours').add(startMinute, 'minutes');
      const slotEnd = startOfDay.clone().add(endHour, 'hours').add(endMinute, 'minutes');
      
      // If it's the current date, start from current time (rounded up to next 30-minute interval)
      if (startOfDay.isSame(now, 'day')) {
        const currentTime = now.clone();
        // Round up to the next 30-minute interval
        const minutes = currentTime.minutes();
        const roundedMinutes = Math.ceil(minutes / 30) * 30;
        currentTime.minutes(roundedMinutes).seconds(0).milliseconds(0);
        
        // If rounded time is after the available start time, use it
        if (currentTime.isAfter(slotStart)) {
          slotStart = currentTime;
        }
      }
      
      const slots = [];
      const currentSlot = slotStart.clone();
      
      while (currentSlot.isBefore(slotEnd)) {
        const slotEndTime = currentSlot.clone().add(duration, 'minutes');
        
        if (slotEndTime.isAfter(slotEnd)) break;
        
        // Check if slot conflicts with any busy time
        const isAvailable = !busySlots.some(busy => 
          (currentSlot.isBefore(busy.end) && slotEndTime.isAfter(busy.start))
        );
        
        if (isAvailable) {
          slots.push({
            start: currentSlot.toDate(),
            end: slotEndTime.toDate(),
            formatted: `${currentSlot.format('HH:mm')} - ${slotEndTime.format('HH:mm')}`
          });
        }
        
        currentSlot.add(30, 'minutes'); // 30-minute intervals
      }
      
      return slots;
    } catch (error) {
      console.error('Error getting available slots:', error);
      throw new Error('Failed to get available time slots');
    }
  }

  // Refresh access token
  async refreshAccessToken(refreshToken) {
    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_CALLBACK_URL
      );

      oauth2Client.setCredentials({
        refresh_token: refreshToken
      });

      const { credentials } = await oauth2Client.refreshAccessToken();
      return credentials.access_token;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw new Error('Failed to refresh access token');
    }
  }
}

module.exports = new GoogleCalendarService(); 