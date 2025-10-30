# Create Super Admin User Script

This script creates a single superadmin user for the Hire Accel platform.

## Usage

Run the following command from the `api` directory:

```bash
npm run create-superadmin
```

## Super Admin User Details

The script creates a superadmin user with the following credentials:

- **Email**: superadmin@hireaccel.com
- **Password**: SuperAdmin123!
- **Role**: superadmin
- **Status**: active
- **Email Verified**: true

## Security Notes

⚠️ **IMPORTANT**: Change the password after first login!

The default password is temporary and should be changed immediately after the first login for security reasons.

## What the Script Does

1. **Checks for existing superadmin**: Prevents duplicate superadmin users
2. **Hashes password**: Uses Argon2id for secure password hashing
3. **Creates user**: Saves the superadmin user to the database
4. **Provides feedback**: Shows user details and login credentials

## Super Admin Capabilities

The superadmin role has the following permissions:

### Full Dashboard Access
- Dashboard
- Agent Allocation
- Company Management
- Job Management
- Shared Candidates
- Interview Management
- User Management
- Post Ads (Banner Management)
- Analytics
- Reports

### Admin User Management
The superadmin's primary purpose is to **create and manage admin users**. Only the superadmin can:
- Create admin users
- View all users including admins and superadmins
- Manage admin user roles

Regular admin users cannot create other admin users.

## Troubleshooting

### Super Admin Already Exists
If a superadmin user already exists, the script will:
- Display the existing superadmin user details
- Exit gracefully without creating a duplicate

### Database Connection Issues
Make sure your MongoDB connection is properly configured in your environment variables.

## Example Output

```
Connecting to MongoDB...
Connected to MongoDB
Hashing superadmin password...
Creating superadmin user...
✅ Super Admin user created successfully!
Super Admin user details:
- ID: 507f1f77bcf86cd799439011
- Email: superadmin@hireaccel.com
- Custom ID: SUPERADMIN001
- Role: superadmin
- Status: active
- Email Verified: true
- Created: 2024-01-15T10:30:00.000Z

🔐 Login Credentials:
Email: superadmin@hireaccel.com
Password: SuperAdmin123!

⚠️  IMPORTANT: Change the password after first login!

📝 The superadmin user can:
- Access all admin screens
- Create and manage admin users
- Manage all system resources

Script completed successfully. MongoDB connection closed.
```

## Differences from Regular Admin

| Feature | Super Admin | Admin |
|---------|-------------|-------|
| Create Admin Users | ✅ Yes | ❌ No |
| Create HR/Agent/Candidate Users | ✅ Yes | ✅ Yes |
| Access All Admin Screens | ✅ Yes | ✅ Yes |
| Manage System Settings | ✅ Yes | ✅ Yes |
| Edit/Delete Admin Users | ✅ Yes | ❌ No |
| Edit/Delete Super Admin Users | ❌ No | ❌ No |

## Best Practices

1. **Limit Super Admin Accounts**: Create only one superadmin account for security
2. **Change Default Password**: Immediately change the password after first login
3. **Use for Admin Creation**: Use this account primarily to create admin users for day-to-day operations
4. **Secure Storage**: Store superadmin credentials securely (password manager, vault, etc.)
5. **Audit Trail**: Monitor superadmin activity regularly

