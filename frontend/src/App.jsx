import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import WelcomePage from './pages/Welcome';
import LoginPage from './pages/LoginPage';

import Register from './pages/Register';
import FaceRecognition from './pages/FaceRecognition';
import AccountCreation from './pages/AccountCreation';
import UsersList from './pages/UsersList';
import UrProfile from './pages/UrProfile';  // Changed from Profile to UrProfile
import Actualite from './pages/actualite';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/actualite" element={<Actualite  />} />
        <Route path="/register" element={<Register />} />
        <Route path="/face-recognition" element={<FaceRecognition />} />
        <Route path="/account-creation" element={<AccountCreation />} />
        <Route path="/users" element={<UsersList />} />
        <Route path="/profile" element={<UrProfile />} />
      </Routes>
    </Router>
  );
};

export default App;