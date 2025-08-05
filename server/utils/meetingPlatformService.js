const axios = require('axios');

class MeetingPlatformService {
  constructor() {
    this.platforms = {
      'zoom': {
        name: 'Zoom',
        generateLink: this.generateZoomLink.bind(this),
        color: '#2D8CFF'
      },
      'teams': {
        name: 'Microsoft Teams',
        generateLink: this.generateTeamsLink.bind(this),
        color: '#6264A7'
      },
      'google-meet': {
        name: 'Google Meet',
        generateLink: this.generateGoogleMeetLink.bind(this),
        color: '#00AC47'
      },
      'zoho': {
        name: 'Zoho Meeting',
        generateLink: this.generateZohoLink.bind(this),
        color: '#FF6B35'
      }
    };
  }

  // Generate Zoom meeting link
  async generateZoomLink(meetingDetails) {
    try {
      // For demo purposes, we'll generate a mock Zoom link
      // In production, you would integrate with Zoom API
      const meetingId = this.generateMeetingId();
      const password = this.generatePassword();
      
      return {
        link: `https://zoom.us/j/${meetingId}?pwd=${password}`,
        meetingId,
        password,
        platform: 'zoom'
      };
    } catch (error) {
      console.error('Error generating Zoom link:', error);
      throw new Error('Failed to generate Zoom meeting link');
    }
  }

  // Generate Microsoft Teams meeting link
  async generateTeamsLink(meetingDetails) {
    try {
      // For demo purposes, we'll generate a mock Teams link
      // In production, you would integrate with Microsoft Graph API
      const meetingId = this.generateMeetingId();
      
      return {
        link: `https://teams.microsoft.com/l/meetup-join/${meetingId}`,
        meetingId,
        platform: 'teams'
      };
    } catch (error) {
      console.error('Error generating Teams link:', error);
      throw new Error('Failed to generate Teams meeting link');
    }
  }

  // Generate Google Meet link
  async generateGoogleMeetLink(meetingDetails) {
    try {
      // For demo purposes, we'll generate a mock Google Meet link
      // In production, you would integrate with Google Calendar API
      const meetingId = this.generateMeetingId();
      
      return {
        link: `https://meet.google.com/${meetingId}`,
        meetingId,
        platform: 'google-meet'
      };
    } catch (error) {
      console.error('Error generating Google Meet link:', error);
      throw new Error('Failed to generate Google Meet link');
    }
  }

  // Generate Zoho Meeting link
  async generateZohoLink(meetingDetails) {
    try {
      // For demo purposes, we'll generate a mock Zoho link
      // In production, you would integrate with Zoho Meeting API
      const meetingId = this.generateMeetingId();
      
      return {
        link: `https://meetings.zoho.com/${meetingId}`,
        meetingId,
        platform: 'zoho'
      };
    } catch (error) {
      console.error('Error generating Zoho link:', error);
      throw new Error('Failed to generate Zoho meeting link');
    }
  }

  // Generate meeting link based on platform
  async generateMeetingLink(platform, meetingDetails) {
    const platformConfig = this.platforms[platform];
    
    if (!platformConfig) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    return await platformConfig.generateLink(meetingDetails);
  }

  // Generate a random meeting ID
  generateMeetingId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Generate a random password
  generatePassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Get platform display name
  getPlatformName(platform) {
    return this.platforms[platform]?.name || platform;
  }

  // Get platform color
  getPlatformColor(platform) {
    return this.platforms[platform]?.color || '#666';
  }

  // Get all available platforms
  getAvailablePlatforms() {
    return Object.keys(this.platforms).map(key => ({
      value: key,
      name: this.platforms[key].name,
      color: this.platforms[key].color
    }));
  }
}

module.exports = new MeetingPlatformService(); 