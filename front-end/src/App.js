import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomeScreen from './components/HomeScreen';
import FanDetails from './components/FanDetails';
import UserProfile from "./components/UserProfile";
import Notifications from './components/Notifications';
import Messages from './components/Messages';
import Profile from './components/Profile';
import Auth from './components/Auth';
import ProtectedRoute from './components/ProtectedRoute';
import { NavigationProvider } from './contexts/NavigationContext';
import { AuthProvider } from './contexts/AuthContext';
import BackButton from './components/BackButton';

function App() {
    return (
        <Router>
            <AuthProvider>
                <NavigationProvider>
                    <div className="app-container">
                        <Routes>
                            <Route exact path="/" element={<HomeScreen />} />
                            <Route path="/auth" element={<Auth />} />
                            <Route path="/login" element={<Navigate to="/auth" />} />
                            <Route path="/register" element={<Navigate to="/auth" />} />
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
                            <Route path="/profile/:id" element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            } />
                        </Routes>
                    </div>
                </NavigationProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
