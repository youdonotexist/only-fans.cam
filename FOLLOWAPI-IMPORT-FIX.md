# FollowAPI Import Fix

## Issue Description
The build process was failing with the following error:
```
10:07:48 PM: Module not found: Error: Can't resolve '../network/followApi' in '/opt/build/repo/front-end/src/components'
```

This error occurred because the Profile.js component was trying to import functions from the followApi module without specifying the file extension (.ts), which caused the module resolution to fail during the build process.

## Root Cause
In the Profile.js file, the import statement was missing the .ts extension:
```javascript
import { followUser, unfollowUser, checkIfFollowing } from '../network/followApi';
```

While this works in development with certain configurations, it can cause issues during production builds, especially in environments with strict module resolution rules.

## Solution
The fix was to add the .ts extension to the import path:
```javascript
import { followUser, unfollowUser, checkIfFollowing } from '../network/followApi.ts';
```

This ensures that the TypeScript compiler can correctly resolve the module during the build process.

## Files Changed
- `/front-end/src/components/Profile.js`: Updated the import statement to include the .ts extension

## Verification
To verify the fix:
1. Run the build process with `npm run build`
2. Confirm that the build completes without the module resolution error
3. Verify that the Profile page loads correctly in the browser
4. Test the Subscribe button functionality on other users' profiles to ensure the imported functions work correctly

## Additional Notes
- This type of issue is common when working with TypeScript in JavaScript files
- In some build configurations, explicit file extensions are required for non-JavaScript files
- For consistency, consider adding the .ts extension to all TypeScript imports in JavaScript files