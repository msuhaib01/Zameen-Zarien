import React from 'react';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';
import './App.css';

function Navbar() {
  return (
    <nav className="navbar">
      <h1>Zameen Zarien</h1>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/prices">Prices</Link></li>
      </ul>
    </nav>
  );
}

function Home() {
  return (
    <div className="content">
      <h2>Welcome to Zameen Zarien</h2>
      <p>Platform for crop price trends.</p>
    </div>
  );
}

function Prices() {
  return (
    <div className="content">
      <h2>Crop Prices</h2>
      <div className="card">
        <p>Wheat: $300/ton</p>
        <p>Cotton: $500/ton</p>
        <p>Corn: $250/ton</p>
        <p>Rice: $400/ton</p>
        <p>Soybeans: $450/ton</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div>
        <Navbar />
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/prices" component={Prices} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;