import React from 'react';
import { StatusBar } from 'expo-status-bar';
import './App.css';

export default function App() {
  return (
    <div className="app-container" style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6' }}>
      {/* Navbar */}
      <nav className="navbar" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        backgroundColor: '#2c3e50',
        color: '#ecf0f1',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 className="navbar-title" style={{ margin: 0, fontSize: '1.5rem' }}>Zameen-Zarien</h1>
        <ul className="navbar-list" style={{ display: 'flex', listStyle: 'none', margin: 0, padding: 0 }}>
          {['Home', 'About', 'Services', 'Contact'].map((item) => (
            <li
              key={item}
              className="navbar-item"
              style={{ margin: '0 1rem', cursor: 'pointer', fontSize: '1rem' }}
            >
              {item}
            </li>
          ))}
        </ul>
      </nav>

      {/* Homepage Content */}
      <div
        className="main-content"
        style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'linear-gradient(to bottom, #e3f2fd, #fff)',
        }}
      >
        <h1 style={{ fontSize: '2.5rem', color: '#34495e', marginBottom: '1rem' }}>KhushAmdeed</h1>
        <p style={{ fontSize: '1.25rem', color: '#7f8c8d' }}>
          Welcome to our platform where nature meets technology.
        </p>
      </div>

      {/* Footer */}
      <footer
        className="footer"
        style={{
          backgroundColor: '#34495e',
          color: '#ecf0f1',
          padding: '2rem 1rem',
          textAlign: 'center',
          marginTop: '2rem',
        }}
      >
        <p style={{ margin: '0.5rem 0' }}>&copy; 2024 Zameen-Zarien. All rights reserved.</p>
        <div className="footer-links" style={{ marginTop: '1rem' }}>
          {['Privacy Policy', 'Terms of Service'].map((link) => (
            <a
              key={link}
              href="#"
              className="footer-link"
              style={{
                color: '#1abc9c',
                margin: '0 0.5rem',
                textDecoration: 'none',
                fontSize: '1rem',
              }}
            >
              {link}
            </a>
          ))}
        </div>
      </footer>

      <StatusBar style="auto" />
    </div>
  );
}
