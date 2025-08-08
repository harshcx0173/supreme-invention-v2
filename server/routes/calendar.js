const express = require("express");
const { query, body, validationResult } = require("express-validator");
const moment = require("moment");
const router = express.Router();

const googleCalendarService = require("../utils/googleCalendar");
const User = require("../models/User");

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
};

// Get available time slots for a specific date
router.get(
  "/available-slots",
  requireAuth,
  [
    query("date").isISO8601().withMessage("Valid date is required"),
    query("duration")
      .optional()
      .isInt({ min: 15, max: 120 })
      .withMessage("Duration must be between 15 and 120 minutes"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { date, duration = 30 } = req.query;
      const selectedDate = moment(date).startOf("day");

      // Check if date is in the past
      if (selectedDate.isBefore(moment().startOf("day"))) {
        return res
          .status(400)
          .json({ error: "Cannot book appointments in the past" });
      }

      // Get admin user (you might want to make this configurable)
      const adminUser = await User.findOne({ isAdmin: true });
      if (!adminUser) {
        return res.status(500).json({ error: "Admin user not found" });
      }

      // Create OAuth2 client for admin
      const auth = googleCalendarService.createOAuth2Client(
        adminUser.accessToken,
        adminUser.refreshToken
      );

      // Get available slots
      const availableSlots = await googleCalendarService.getAvailableSlots(
        auth,
        selectedDate.toDate(),
        duration,
        process.env.ADMIN_CALENDAR_ID || "primary"
      );

      res.json({
        date: selectedDate.format("YYYY-MM-DD"),
        duration,
        availableSlots,
      });
    } catch (error) {
      console.error("Error getting available slots:", error);
      res.status(500).json({ error: "Failed to get available time slotsssss" });
    }
  }
);

// Check if a specific time slot is available
router.post(
  "/check-availability",
  requireAuth,
  [
    body("startTime").isISO8601().withMessage("Valid start time is required"),
    body("endTime").isISO8601().withMessage("Valid end time is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { startTime, endTime } = req.body;
      const start = moment(startTime);
      const end = moment(endTime);

      // Validate time range
      if (start.isAfter(end)) {
        return res
          .status(400)
          .json({ error: "Start time must be before end time" });
      }

      if (start.isBefore(moment())) {
        return res
          .status(400)
          .json({ error: "Cannot book appointments in the past" });
      }

      // Get admin user
      const adminUser = await User.findOne({ isAdmin: true });
      if (!adminUser) {
        return res.status(500).json({ error: "Admin user not found" });
      }

      // Create OAuth2 client for admin
      const auth = googleCalendarService.createOAuth2Client(
        adminUser.accessToken,
        adminUser.refreshToken
      );

      // Check availability
      const isAvailable = await googleCalendarService.checkAvailability(
        auth,
        start.toDate(),
        end.toDate(),
        process.env.ADMIN_CALENDAR_ID || "primary"
      );

      res.json({
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        isAvailable,
      });
    } catch (error) {
      console.error("Error checking availability:", error);
      res.status(500).json({ error: "Failed to check availability" });
    }
  }
);

// Get calendar events for a date range (for admin dashboard)
router.get(
  "/events",
  requireAuth,
  [
    body("startDate")
      .optional()
      .isISO8601()
      .withMessage("Valid start date is required"),
    body("endDate")
      .optional()
      .isISO8601()
      .withMessage("Valid end date is required"),
  ],
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate
        ? moment(startDate).startOf("day")
        : moment().startOf("day");
      const end = endDate
        ? moment(endDate).endOf("day")
        : moment().add(7, "days").endOf("day");

      // Get admin user
      const adminUser = await User.findOne({ isAdmin: true });
      if (!adminUser) {
        return res.status(500).json({ error: "Admin user not found" });
      }

      // Create OAuth2 client for admin
      const auth = googleCalendarService.createOAuth2Client(
        adminUser.accessToken,
        adminUser.refreshToken
      );

      // Get events from Google Calendar
      const response = await googleCalendarService.calendar.events.list({
        auth,
        calendarId: process.env.ADMIN_CALENDAR_ID || "primary",
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
        singleEvents: true,
        orderBy: "startTime",
      });

      res.json({
        events: response.data.items,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });
    } catch (error) {
      console.error("Error getting calendar events:", error);
      res.status(500).json({ error: "Failed to get calendar events" });
    }
  }
);

module.exports = router;
