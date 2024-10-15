import React from 'react';
import { StatusBar } from 'expo-status-bar';
import './App.css';
export default function App() {
  return (
    <div className="app-container">
      {/* Navbar */}
      <nav className="navbar">
        <h1 className="navbar-title">Zameen-Zarien</h1>
        <ul className="navbar-list">
          <li className="navbar-item">Home</li>
          <li className="navbar-item">About</li>
          <li className="navbar-item">Services</li>
          <li className="navbar-item">Contact</li>
        </ul>
      </nav>

      {/* Homepage Content */}
      <div className="main-content">
        <h1>KhushAmdeed or sm</h1>
        <p>some text as well</p>
      </div>

      <StatusBar style="auto" />
    </div>
  );
}
