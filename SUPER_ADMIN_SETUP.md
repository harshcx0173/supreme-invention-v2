# Super Admin Setup Guide

## Overview

This application now has a three-tier user permission system:

1. **Regular Users** - Can book meetings and view their own bookings
2. **Admins** - Can manage all bookings and view booking statistics
3. **Super Admins** - Can manage all bookings AND manage user permissions (admin/super admin status)

## User Roles

### Regular Users
- Book meetings
- View their own bookings
- Access dashboard

### Admins
- All regular user permissions
- View all bookings
- Update booking statuses
- View booking statistics
- Access admin dashboard

### Super Admins
- All admin permissions
- **Exclusive access to User Management**
- Can promote/demote users to admin status
- Can promote/demote users to super admin status
- View user statistics

## Setting Up Your First Super Admin

### Step 1: Create a Regular User
First, have someone sign up through Google OAuth to create a user account.

### Step 2: Make Them Super Admin
Use the utility script to promote a user to super admin:

```bash
cd server
node utils/createSuperAdmin.js create user@example.com
```

### Step 3: Verify Super Admin Status
Check all super admins:

```bash
node utils/createSuperAdmin.js list
```

## User Management Features

### Super Admin Dashboard
- **User Management** link in navigation (only visible to super admins)
- View all users with their current roles
- Toggle admin status for any user
- Toggle super admin status for any user
- View user statistics (total users, admins, super admins, regular users)

### User Table Features
- User profile picture and name
- Email address
- Join date
- Last login time
- Current role (Regular User, Admin, or Super Admin)
- Toggle switches for admin and super admin status
- Loading indicators during status updates

## Security Features

- **Self-Protection**: Super admins cannot remove their own super admin status
- **Role Hierarchy**: Super admins are automatically also admins
- **Access Control**: Only super admins can access user management
- **API Protection**: All user management endpoints require super admin authentication

## API Endpoints

### Super Admin Only Endpoints
- `GET /api/super-admin/users` - Get all users
- `PATCH /api/super-admin/users/:userId/admin-status` - Update admin status
- `PATCH /api/super-admin/users/:userId/super-admin-status` - Update super admin status
- `GET /api/super-admin/stats` - Get user statistics

## Database Schema Updates

The User model now includes:
```javascript
{
  // ... existing fields
  isAdmin: { type: Boolean, default: false },
  isSuperAdmin: { type: Boolean, default: false }
}
```

## Navigation Changes

- **Regular Users**: See Home, Dashboard, Book Meeting, My Bookings
- **Admins**: See Home, Dashboard, Book Meeting, My Bookings, Admin
- **Super Admins**: See Home, Dashboard, Book Meeting, My Bookings, Admin, User Management

## Troubleshooting

### User Management Not Visible
- Ensure the user has `isSuperAdmin: true` in the database
- Check that the user is properly authenticated
- Verify the user object includes `isSuperAdmin` field

### Cannot Access User Management
- Only super admins can access `/admin/users`
- Regular admins will be redirected to dashboard
- Check browser console for any authentication errors

### Utility Script Issues
- Ensure MongoDB is running
- Check that the user email exists in the database
- Verify database connection string in `.env` file

## Best Practices

1. **Limit Super Admins**: Only promote trusted users to super admin
2. **Regular Audits**: Periodically review super admin list
3. **Backup Super Admin**: Always have at least 2 super admins
4. **Documentation**: Keep track of who has super admin access
5. **Security**: Super admins should use strong passwords and 2FA

## Migration Notes

If you're upgrading from the previous version:
1. The `isSuperAdmin` field will be `false` for all existing users
2. Use the utility script to promote your first super admin
3. Existing admin users will need to be promoted to super admin if they need user management access
