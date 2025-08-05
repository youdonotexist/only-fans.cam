# Invite Code Feature Documentation

## Overview
The invite code feature adds a layer of access control to the OnlyFans application by requiring users to enter a valid invite code during registration. This helps control who can register for the platform and can be used for private beta testing, exclusive communities, or marketing campaigns.

## Implementation Details

### Backend Changes
1. Added an environment variable `INVITE_CODE` to control the valid invite code
2. Added validation middleware to require an invite code during registration
3. Added logic to validate the submitted invite code against the configured value

### Frontend Changes
1. Added an invite code field to the registration form
2. Updated form validation to require the invite code
3. Updated the registration API call to include the invite code
4. Updated TypeScript interfaces to include the invite code

## Configuration

### Setting the Invite Code
The invite code can be configured using an environment variable:

```
INVITE_CODE=your_custom_code
```

If not specified, the default invite code is `ONLYFANS2025`.

### Environment Variable Setup

#### Development
Add the `INVITE_CODE` variable to your `.env` file:

```
INVITE_CODE=your_custom_code
```

#### Production
Set the environment variable in your hosting environment:

- **Netlify**: Add the variable in Site settings > Build & deploy > Environment variables
- **Vercel**: Add the variable in Project settings > Environment Variables
- **Docker**: Add the variable in your docker-compose.yml or use the -e flag with docker run

## Testing
A test script is provided to verify the invite code functionality:

```
node test-invite-code.js
```

This script tests:
1. Registration with a valid invite code (should succeed)
2. Registration with an invalid invite code (should fail)

## Security Considerations
- The invite code is a simple string comparison and is not meant for high-security applications
- Consider implementing more robust access control for highly sensitive applications
- The invite code is transmitted in plaintext, so it should not contain sensitive information

## Future Improvements
- Add ability to manage multiple invite codes
- Add expiration dates for invite codes
- Add tracking of which invite code was used by each user
- Implement rate limiting to prevent brute force attacks on invite codes