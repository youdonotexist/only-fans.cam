# Mobile Button Centering Summary

## Issue
On the My profile page, the edit profile and logout button SVG icons and text were not properly centered when viewed on mobile devices.

## Solution
Added `justify-content: center` to the mobile-specific styles for the edit profile and logout buttons to ensure that the SVG icons and text are properly centered when viewed on mobile devices.

## Implementation Details

### Changes Made
Modified the CSS in `Profile.module.css` to add `justify-content: center` to the mobile-specific styles for the edit profile and logout buttons:

```css
@media (max-width: 768px) {
    /* Other mobile styles... */
    
    .profileActions {
        flex-direction: column;
        gap: var(--space-sm);
        align-items: center;
    }
    
    .editProfileBtn, .logoutBtn {
        width: 100%;
        max-width: 250px;
        justify-content: center;  /* Added this line */
    }
}
```

### Explanation
1. The buttons already had `display: inline-flex` and `align-items: center` in their base styles, which vertically centers the content.
2. However, they were missing `justify-content: center` which is needed to horizontally center the content (SVG icon and text).
3. By adding `justify-content: center` to the mobile-specific styles, we ensure that the SVG icons and text are properly centered when viewed on mobile devices.

## Benefits
- Improved visual appearance on mobile devices
- Better alignment of button content
- Consistent styling across the application
- Enhanced user experience on smaller screens

## Testing
The changes were tested on mobile screen sizes to verify that the SVG icons and text are properly centered within the buttons.