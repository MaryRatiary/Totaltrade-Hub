import React from 'react';
import './Navbar.css'; // Assurez-vous d'importer le fichier CSS
import logo from '/public/tth-removebg.png'; // Assurez-vous de mettre le bon chemin vers votre logo

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img src={logo} alt="TotalTradeHub Logo" className="navbar-logo" />
        <ul className="navbar-links-right">
          <li><a href="/bizness-pro">Bizness-Pro</a></li>
          <li><a href="/e-jery">E-Jery</a></li>
        </ul>
      </div>
      <ul className="navbar-links">
        <li><a href="/profile">Mon Profile</a></li>
        <li><a href="/settings">Settings</a></li>
      </ul>
    </nav>
  );
};

export default Navbar;
