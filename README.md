# Meeting Booking App

A full-stack meeting booking application with Google OAuth authentication and Google Calendar integration. Users can view available time slots, book meetings, and have events automatically created in both the admin's and user's Google Calendars.

## Features

- 🔐 **Google OAuth Authentication** - Secure sign-in with Google accounts
- 📅 **Google Calendar Integration** - Automatic event creation in both admin and user calendars
- ⏰ **Real-time Availability** - View available time slots based on admin's calendar
- 📱 **Responsive Design** - Modern UI with Tailwind CSS
- 🔄 **Booking Management** - Create, view, and cancel bookings
- 👨‍💼 **Admin Dashboard** - Manage all bookings and user access
- 🗄️ **MongoDB Storage** - Persistent data storage for bookings and users
- ✅ **Validation** - Slot availability validation before booking

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Passport.js** - Authentication middleware
- **Google APIs** - Calendar integration
- **Moment.js** - Date/time manipulation

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling framework
- **Axios** - HTTP client
- **React DatePicker** - Date selection component
- **Lucide React** - Icons
- **React Hot Toast** - Notifications

## Prerequisites

Before running this application, you need:

1. **Node.js** (v14 or higher)
2. **MongoDB** (local or cloud instance)
3. **Google Cloud Console** project with:
   - Google OAuth 2.0 credentials
   - Google Calendar API enabled

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd meeting-booking-app
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 3. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:5000/auth/google/callback` (development)
     - `https://yourdomain.com/auth/google/callback` (production)
5. Note down your Client ID and Client Secret

### 4. Environment Configuration

1. Copy the environment example file:
   ```bash
   cd server
   cp env.example .env
   ```

2. Update the `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/meeting-booking-app

   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

   # Session Configuration
   SESSION_SECRET=your_session_secret_key

   # Admin Calendar ID (where meetings will be created)
   ADMIN_CALENDAR_ID=primary

   # Meeting Duration (in minutes)
   MEETING_DURATION=30

   # Available Time Slots (24-hour format)
   AVAILABLE_START_TIME=09:00
   AVAILABLE_END_TIME=17:00
   ```

### 5. Database Setup

1. Start MongoDB:
   ```bash
   # Local MongoDB
   mongod

   # Or use MongoDB Atlas (cloud)
   # Update MONGODB_URI in .env with your Atlas connection string
   ```

2. The application will automatically create the necessary collections on first run.

### 6. Set Up Admin User

1. Start the application (see next step)
2. Sign in with the Google account you want to use as admin
3. Manually update the user in MongoDB to set `isAdmin: true`:
   ```javascript
   // In MongoDB shell or MongoDB Compass
   db.users.updateOne(
     { email: "admin@example.com" },
     { $set: { isAdmin: true } }
   )
   ```

### 7. Run the Application

#### Development Mode

```bash
# From the root directory
npm run dev
```

This will start both the backend (port 5000) and frontend (port 3000) concurrently.

#### Production Mode

```bash
# Build the frontend
cd client
npm run build

# Start the backend
cd ../server
npm start
```

### 8. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## API Endpoints

### Authentication
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - OAuth callback
- `GET /auth/logout` - Logout user
- `GET /auth/user` - Get current user
- `GET /auth/status` - Check authentication status

### Bookings
- `GET /api/bookings` - Get all bookings (admin only)
- `GET /api/bookings/my-bookings` - Get user's bookings
- `GET /api/bookings/:id` - Get specific booking
- `POST /api/bookings` - Create new booking
- `PATCH /api/bookings/:id/status` - Update booking status (admin only)
- `DELETE /api/bookings/:id` - Cancel booking

### Calendar
- `GET /api/calendar/available-slots` - Get available time slots
- `POST /api/calendar/check-availability` - Check slot availability
- `GET /api/calendar/events` - Get calendar events (admin only)

## Usage

### For Users

1. **Sign In**: Click "Sign in with Google" on the home page
2. **Book a Meeting**: 
   - Navigate to "Book Meeting"
   - Select a date
   - Choose from available time slots
   - Fill in meeting details
   - Confirm booking
3. **Manage Bookings**: View and cancel your bookings in "My Bookings"

### For Admins

1. **Access Admin Dashboard**: Navigate to "Admin" in the navigation
2. **View All Bookings**: See all bookings in the system
3. **Manage Bookings**: Update booking statuses and view user information
4. **Monitor Activity**: View booking statistics and trends

## Configuration Options

### Meeting Settings

You can customize meeting settings in the `.env` file:

- `MEETING_DURATION`: Duration of meetings in minutes (default: 30)
- `AVAILABLE_START_TIME`: Start time for available slots (default: 09:00)
- `AVAILABLE_END_TIME`: End time for available slots (default: 17:00)

### Calendar Integration

- `ADMIN_CALENDAR_ID`: Calendar ID where admin events are created (default: "primary")
- The system automatically creates events in both admin and user calendars

## Security Features

- **OAuth 2.0**: Secure Google authentication
- **Session Management**: Secure session handling with express-session
- **Input Validation**: Server-side validation using express-validator
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS**: Configured CORS for secure cross-origin requests
- **Helmet**: Security headers with helmet middleware

## Troubleshooting

### Common Issues

1. **Google OAuth Error**: 
   - Verify your Google Client ID and Secret
   - Check that redirect URIs are correctly configured
   - Ensure Google Calendar API is enabled

2. **MongoDB Connection Error**:
   - Verify MongoDB is running
   - Check your connection string in `.env`
   - Ensure network access if using MongoDB Atlas

3. **Calendar Integration Issues**:
   - Verify admin user has proper Google Calendar permissions
   - Check that the admin user's access token is valid
   - Ensure the calendar ID is correct

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your `.env` file.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository. 
