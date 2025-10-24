# Create Admin User Script

This script creates a single admin user for the Hire Accel platform.

## Usage

Run the following command from the `api` directory:

```bash
npm run create-admin
```

## Admin User Details

The script creates an admin user with the following credentials:

- **Email**: admin@hireaccel.com
- **Password**: Admin123!
- **Role**: admin
- **Status**: active
- **Email Verified**: true

## Security Notes

⚠️ **IMPORTANT**: Change the password after first login!

The default password is temporary and should be changed immediately after the first login for security reasons.

## What the Script Does

1. **Checks for existing admin**: Prevents duplicate admin users
2. **Hashes password**: Uses Argon2id for secure password hashing
3. **Creates user**: Saves the admin user to the database
4. **Provides feedback**: Shows user details and login credentials

## Troubleshooting

### Admin Already Exists
If an admin user already exists, the script will:
- Display the existing admin user details
- Exit gracefully without creating a duplicate

### Database Connection Issues
Make sure your MongoDB connection is properly configured in your environment variables.

## Example Output

```
Connecting to MongoDB...
Connected to MongoDB
Hashing admin password...
Creating admin user...
✅ Admin user created successfully!
Admin user details:
- ID: 507f1f77bcf86cd799439011
- Email: admin@hireaccel.com
- Custom ID: ADMIN001
- Role: admin
- Status: active
- Email Verified: true
- Created: 2024-01-15T10:30:00.000Z

🔐 Login Credentials:
Email: admin@hireaccel.com
Password: Admin123!

⚠️  IMPORTANT: Change the password after first login!

Script completed successfully. MongoDB connection closed.
```
