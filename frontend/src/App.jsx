import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import WelcomePage from './pages/Welcome';
import LoginPage from './pages/LoginPage';
import Register from './pages/Register';
import FaceRecognition from './pages/FaceRecognition';
import AccountCreation from './pages/AccountCreation';
import Dashboard from './pages/Dashboard';
import UserProfile from './pages/UserProfile';
import Settings from './pages/Settings';
import Actualite from './pages/actualite';
import UsersPage from './pages/UsersPage';
import Calendar from './pages/Calendar';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/WelcomePage" element={<WelcomePage />} />
        <Route path="/" element={<LoginPage />} />
        <Route path="/actualite" element={<Actualite />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/face-recognition" element={<FaceRecognition />} />
        <Route path="/account-creation" element={<AccountCreation />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/settings" element={<Settings/>} />
        <Route path="/calendar" element={<Calendar/>}/>
      </Routes>
    </Router>
  );
};

export default App;