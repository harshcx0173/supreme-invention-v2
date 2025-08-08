const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Middleware to check if user is authenticated and is super admin
const requireSuperAdmin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  if (!req.user.isSuperAdmin) {
    return res.status(403).json({ error: "Super admin access required" });
  }
  
  next();
};

// Get all users (super admin only)
router.get("/users", requireSuperAdmin, async (req, res) => {
  try {
    const users = await User.find({}, {
      googleId: 1,
      email: 1,
      name: 1,
      picture: 1,
      isAdmin: 1,
      isSuperAdmin: 1,
      lastLogin: 1,
      createdAt: 1
    }).sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Update user admin status (super admin only)
router.patch("/users/:userId/admin-status", requireSuperAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { isAdmin } = req.body;

    // Prevent super admin from removing their own admin status
    if (userId === req.user._id.toString() && !isAdmin) {
      return res.status(400).json({ 
        error: "You cannot remove your own admin status" 
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isAdmin },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: `User ${user.name} ${isAdmin ? 'promoted to' : 'removed from'} admin successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isSuperAdmin: user.isSuperAdmin
      }
    });
  } catch (error) {
    console.error("Error updating user admin status:", error);
    res.status(500).json({ error: "Failed to update user admin status" });
  }
});

// Update user super admin status (super admin only)
router.patch("/users/:userId/super-admin-status", requireSuperAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { isSuperAdmin } = req.body;

    // Prevent super admin from removing their own super admin status
    if (userId === req.user._id.toString() && !isSuperAdmin) {
      return res.status(400).json({ 
        error: "You cannot remove your own super admin status" 
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isSuperAdmin },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: `User ${user.name} ${isSuperAdmin ? 'promoted to' : 'removed from'} super admin successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isSuperAdmin: user.isSuperAdmin
      }
    });
  } catch (error) {
    console.error("Error updating user super admin status:", error);
    res.status(500).json({ error: "Failed to update user super admin status" });
  }
});

// Get super admin statistics
router.get("/stats", requireSuperAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ isAdmin: true });
    const superAdminUsers = await User.countDocuments({ isSuperAdmin: true });
    const regularUsers = totalUsers - adminUsers;

    res.json({
      totalUsers,
      adminUsers,
      superAdminUsers,
      regularUsers
    });
  } catch (error) {
    console.error("Error fetching super admin stats:", error);
    res.status(500).json({ error: "Failed to fetch super admin statistics" });
  }
});

module.exports = router;
