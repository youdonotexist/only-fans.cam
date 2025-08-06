import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomeScreen from './components/HomeScreen';
import FanDetails from './components/FanDetails';
import UserProfile from "./components/UserProfile";
import Notifications from './components/Notifications';
import Messages from './components/Messages';
import Profile from './components/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import { NavigationProvider } from './contexts/NavigationContext';
import { AuthProvider } from './contexts/AuthContext';
import { LoginModalProvider } from './contexts/LoginModalContext';
import BackButton from './components/BackButton';

function App() {
    return (
        <Router>
            <AuthProvider>
                <LoginModalProvider>
                    <NavigationProvider>
                        <div className="app-container">
                            <Routes>
                                <Route exact path="/" element={<HomeScreen />} />
                                <Route path="/fandetails/:id" element={<FanDetails />} />
                                <Route path="/fanfan/:name" element={<UserProfile />} />
                                <Route path="/notifications" element={
                                    <ProtectedRoute>
                                        <Notifications />
                                    </ProtectedRoute>
                                } />
                                <Route path="/messages" element={
                                    <ProtectedRoute>
                                        <Messages />
                                    </ProtectedRoute>
                                } />
                                {/* Profile route is now accessed only through the sidebar user profile */}
                                <Route path="/profile/:id" element={
                                    <ProtectedRoute>
                                        <Profile />
                                    </ProtectedRoute>
                                } />
                                <Route path="/user/:username" element={
                                    <ProtectedRoute>
                                        <Profile />
                                    </ProtectedRoute>
                                } />
                            </Routes>
                        </div>
                    </NavigationProvider>
                </LoginModalProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
