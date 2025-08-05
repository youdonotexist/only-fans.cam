# OnlyFans Navigation and Authentication System

This document outlines the navigation and authentication system implemented in the OnlyFans application.

## Navigation System

### Components

1. **NavigationContext**
   - Provides a global navigation history stack
   - Tracks page navigation history
   - Enables back navigation across the application

2. **BackButton**
   - Appears on appropriate pages
   - Uses NavigationContext to navigate back
   - Automatically hides when there's no history to go back to

3. **PageLayout**
   - Common layout component used across pages
   - Integrates BackButton
   - Provides consistent page structure

### Navigation Flow

The navigation system maintains a history stack of visited pages, allowing users to navigate back to previous pages. The flow works as follows:

1. When a user navigates to a new page, the page is added to the history stack
2. The BackButton appears on pages where navigation history exists
3. Clicking the BackButton removes the current page from the history stack and navigates to the previous page
4. If there's no previous page (e.g., on the home page), the BackButton is not displayed

### Implementation Details

```jsx
// NavigationContext.js
export const NavigationProvider = ({ children }) => {
  const [history, setHistory] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  // Update history when location changes
  useEffect(() => {
    if (history.length === 0 || history[history.length - 1] !== location.pathname) {
      setHistory(prev => [...prev, location.pathname]);
    }
  }, [location.pathname, history]);

  // Go back to the previous page
  const goBack = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop();
      const previousPage = newHistory[newHistory.length - 1];
      navigate(previousPage);
      setHistory(newHistory);
    } else {
      navigate('/');
    }
  };

  const canGoBack = history.length > 1;

  return (
    <NavigationContext.Provider value={{ history, goBack, canGoBack }}>
      {children}
    </NavigationContext.Provider>
  );
};
```

## Authentication System

### Components

1. **AuthContext**
   - Manages authentication state
   - Provides login/logout functionality
   - Stores user information

2. **ProtectedRoute**
   - Wraps routes that require authentication
   - Shows login modal when unauthenticated users try to access protected content
   - Redirects to the requested page after successful login

3. **LoginModal**
   - Appears when unauthenticated users try to access protected content
   - Provides login form without navigating away from the current page
   - Redirects to the originally requested page after successful login

### Authentication Flow

The authentication flow works as follows:

1. When a user tries to access a protected route (e.g., Profile, Messages), the ProtectedRoute component checks if the user is authenticated
2. If authenticated, the user can access the protected content
3. If not authenticated:
   - The LoginModal appears
   - The user can log in without navigating away from the current page
   - After successful login, the user is redirected to the originally requested page
   - The navigation history is preserved

### Implementation Details

```jsx
// ProtectedRoute.js
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [showLoginModal, setShowLoginModal] = useState(true);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return children;
  }

  if (showLoginModal) {
    return (
      <>
        <div style={{ opacity: 0.5, pointerEvents: 'none' }}>
          {children}
        </div>
        
        <LoginModal 
          onClose={() => setShowLoginModal(false)} 
          redirectPath={location.pathname}
        />
      </>
    );
  }

  return <Navigate to="/auth" state={{ from: location }} replace />;
};
```

## Integration with React Router

The navigation and authentication systems are integrated with React Router:

```jsx
// App.js
function App() {
  return (
    <Router>
      <AuthProvider>
        <NavigationProvider>
          <Routes>
            <Route exact path="/" element={<HomeScreen />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/fandetails/:id" element={<FanDetails />} />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            } />
            {/* Other routes... */}
          </Routes>
        </NavigationProvider>
      </AuthProvider>
    </Router>
  );
}
```

## Best Practices

1. **Consistent Layout**: Use PageLayout for consistent page structure
2. **Back Navigation**: Include BackButton on all non-root pages
3. **Protected Routes**: Wrap routes requiring authentication with ProtectedRoute
4. **Authentication State**: Use AuthContext to manage authentication state
5. **Navigation History**: Use NavigationContext to manage navigation history

## Testing

A test script (`test-navigation-flow.js`) is provided to verify the navigation and authentication flow. This script includes a checklist for manual testing of:

- Back button visibility on appropriate pages
- Navigation history across different page flows
- Authentication flow for protected content
- Edge cases such as page refreshes and deep linking