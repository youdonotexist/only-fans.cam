import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomeScreen from './components/HomeScreen';
import FanDetails from './components/FanDetails';
import UserProfile from "./components/UserProfile";
import Notifications from './components/Notifications';
import Messages from './components/Messages';
import Bookmarks from './components/Bookmarks';
import Profile from './components/Profile';
import Auth from './components/Auth';

function App() {
    return (
        <Router>
            <Routes>
                <Route exact path="/" element={<HomeScreen />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/login" element={<Navigate to="/auth" />} />
                <Route path="/register" element={<Navigate to="/auth" />} />
                <Route path="/fandetails/:id" element={<FanDetails />} />
                <Route path="/fanfan/:name" element={<UserProfile />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/bookmarks" element={<Bookmarks />} />
                <Route path="/profile/:id" element={<Profile />} />
            </Routes>
        </Router>
    );
}

export default App;
