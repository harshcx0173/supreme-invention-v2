const express = require('express');
const passport = require('passport');
const router = express.Router();

// Import passport configuration
require('../config/passport');

// Google OAuth login
router.get('/google', passport.authenticate('google', {
  scope: [
    'profile',
    'email',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ]
}));

// Google OAuth callback
router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/login',
    failureFlash: true 
  }),
  (req, res) => {
    // Successful authentication, redirect to frontend
    res.redirect(process.env.NODE_ENV === 'production' 
      ? 'https://yourdomain.com/dashboard' 
      : 'http://localhost:3000/dashboard');
  }
);

// Logout
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Session destruction failed' });
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    });
  });
});

// Get current user
router.get('/user', (req, res) => {
  if (req.isAuthenticated()) {
    const user = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      picture: req.user.picture,
      isAdmin: req.user.isAdmin,
      isSuperAdmin: req.user.isSuperAdmin
    };
    res.json(user);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Check authentication status
router.get('/status', (req, res) => {
  res.json({ 
    authenticated: req.isAuthenticated(),
    user: req.isAuthenticated() ? {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      picture: req.user.picture,
      isAdmin: req.user.isAdmin,
      isSuperAdmin: req.user.isSuperAdmin
    } : null
  });
});

module.exports = router; 