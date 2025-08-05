const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  // Send online meeting invitation
  async sendOnlineMeetingInvitation(booking, attendees) {
    const meetingDetails = {
      title: booking.title,
      date: new Date(booking.startTime).toLocaleDateString(),
      time: `${new Date(booking.startTime).toLocaleTimeString()} - ${new Date(booking.endTime).toLocaleTimeString()}`,
      organizer: booking.user.name || booking.user.email,
      platform: this.getPlatformDisplayName(booking.meetingPlatform),
      meetingLink: booking.meetingLink,
      description: booking.description
    };

    const emailContent = this.generateOnlineMeetingEmail(meetingDetails);

    return this.sendBulkEmail(attendees, {
      subject: `Meeting Invitation: ${booking.title}`,
      html: emailContent
    });
  }

  // Send offline meeting invitation
  async sendOfflineMeetingInvitation(booking, attendees) {
    const meetingDetails = {
      title: booking.title,
      date: new Date(booking.startTime).toLocaleDateString(),
      time: `${new Date(booking.startTime).toLocaleTimeString()} - ${new Date(booking.endTime).toLocaleTimeString()}`,
      organizer: booking.user.name || booking.user.email,
      location: booking.location,
      description: booking.description
    };

    const emailContent = this.generateOfflineMeetingEmail(meetingDetails);

    return this.sendBulkEmail(attendees, {
      subject: `Meeting Invitation: ${booking.title}`,
      html: emailContent
    });
  }

  // Generate online meeting email HTML
  generateOnlineMeetingEmail(details) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Meeting Invitation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .meeting-info { background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .join-button { display: inline-block; background: #2196f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 15px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>📅 Meeting Invitation</h2>
            <p>You have been invited to a meeting</p>
          </div>
          
          <div class="meeting-info">
            <h3>${details.title}</h3>
            <p><strong>Date:</strong> ${details.date}</p>
            <p><strong>Time:</strong> ${details.time}</p>
            <p><strong>Organizer:</strong> ${details.organizer}</p>
            <p><strong>Platform:</strong> ${details.platform}</p>
            ${details.description ? `<p><strong>Description:</strong> ${details.description}</p>` : ''}
          </div>
          
          <a href="${details.meetingLink}" class="join-button">Join Meeting</a>
          
          <div class="footer">
            <p>This invitation was sent from the Meeting Booking System.</p>
            <p>If you have any questions, please contact the meeting organizer.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate offline meeting email HTML
  generateOfflineMeetingEmail(details) {
    const fullAddress = [
      details.location.address,
      details.location.city,
      details.location.state,
      details.location.postalCode,
      details.location.country
    ].filter(Boolean).join(', ');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Meeting Invitation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .meeting-info { background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .location-button { display: inline-block; background: #4caf50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 15px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>📅 Meeting Invitation</h2>
            <p>You have been invited to an in-person meeting</p>
          </div>
          
          <div class="meeting-info">
            <h3>${details.title}</h3>
            <p><strong>Date:</strong> ${details.date}</p>
            <p><strong>Time:</strong> ${details.time}</p>
            <p><strong>Organizer:</strong> ${details.organizer}</p>
            <p><strong>Location:</strong> ${fullAddress}</p>
            ${details.description ? `<p><strong>Description:</strong> ${details.description}</p>` : ''}
          </div>
          
          ${details.location.googleMapsLink ? `<a href="${details.location.googleMapsLink}" class="location-button">View on Google Maps</a>` : ''}
          
          <div class="footer">
            <p>This invitation was sent from the Meeting Booking System.</p>
            <p>If you have any questions, please contact the meeting organizer.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Send bulk email to multiple recipients
  async sendBulkEmail(recipients, emailOptions) {
    const results = [];
    
    for (const recipient of recipients) {
      try {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: recipient.email,
          subject: emailOptions.subject,
          html: emailOptions.html
        };

        const result = await this.transporter.sendMail(mailOptions);
        results.push({
          email: recipient.email,
          success: true,
          messageId: result.messageId
        });
        console.log(`Email sent successfully to ${recipient.email}`);
      } catch (error) {
        console.error(`Failed to send email to ${recipient.email}:`, error);
        console.warn('Email sending failed, but booking was created successfully');
        results.push({
          email: recipient.email,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  // Get platform display name
  getPlatformDisplayName(platform) {
    const platforms = {
      'zoom': 'Zoom',
      'teams': 'Microsoft Teams',
      'google-meet': 'Google Meet',
      'zoho': 'Zoho Meeting'
    };
    return platforms[platform] || platform;
  }
}

module.exports = new EmailService(); 