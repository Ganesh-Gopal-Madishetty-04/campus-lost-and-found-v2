
import { useState } from 'react';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Report from './pages/Report';
import BrowseItems from './pages/BrowseItems';
import MyReports from './pages/MyReports';

import './App.css';

function App() {
  const [page, setPage] = useState('home');
  const [reportType, setReportType] = useState('Lost');

  // Store submitted reports in React state
  const [reports, setReports] = useState([]);

  // LOGIN PAGE
  if (page === 'login') {
    return (
      <Login onLogin={() => setPage('dashboard')} />
    );
  }

  // DASHBOARD PAGE
  if (page === 'dashboard') {
    return (
      <Dashboard
        onReport={(type) => {
          setReportType(type);
          setPage('report');
        }}
        onBrowse={() => setPage('browse')}
        onMyReports={() => setPage('myreports')}
        onMatches={() => setPage('matches')}
        onNotifications={() => setPage('notifications')}
        onLogout={() => setPage('login')}
      />
    );
  }

  // REPORT PAGE
  if (page === 'report') {
    return (
      <Report
        type={reportType}
        onBack={() => setPage('dashboard')}
        onSubmit={(newReport) => {
          setReports((previousReports) => [
            newReport,
            ...previousReports
          ]);
        }}
      />
    );
  }

  // BROWSE ITEMS PAGE
  if (page === 'browse') {
    return (
      <BrowseItems
        items={reports}
        onBack={() => setPage('dashboard')}
      />
    );
  }

  // MY REPORTS PAGE
  if (page === 'myreports') {
    return (
      <MyReports
        reports={reports}
        onBack={() => setPage('dashboard')}
      />
    );
  }

  // AI POSSIBLE MATCHES PAGE
  if (page === 'matches') {
    return (
      <div className="dashboard-page">
        <main className="dashboard-content">
          <button onClick={() => setPage('dashboard')}>
            ← Back to Dashboard
          </button>

          <h1>✨ AI Possible Matches</h1>
          <p>
            Possible matches for lost and found items
            will appear here.
          </p>
        </main>
      </div>
    );
  }

  // NOTIFICATIONS PAGE
  if (page === 'notifications') {
    return (
      <div className="dashboard-page">
        <main className="dashboard-content">
          <button onClick={() => setPage('dashboard')}>
            ← Back to Dashboard
          </button>

          <h1>🔔 Notifications</h1>
          <p>
            Your report updates and notifications
            will appear here.
          </p>
        </main>
      </div>
    );
  }

  // HOMEPAGE
  return (
    <div className="website">

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo">
          <span className="logo-icon">CL</span>
          CampusLost
        </div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#features">About</a>
          <a href="#features">Features</a>

          <button
            className="login-btn"
            onClick={() => setPage('login')}
          >
            Login
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero" id="home">

        <div className="hero-content">
          <span className="tag">
            SMART CAMPUS LOST & FOUND
          </span>

          <h1>
            Lost Something?
            <span>Find It Here.</span>
          </h1>

          <p>
            A smarter way to report lost items and reconnect
            belongings with their owners. Making your campus
            a better place.
          </p>

          <div className="buttons">
            <button
              className="get-started"
              onClick={() => setPage('login')}
            >
              Get Started →
            </button>

            <a href="#features" className="explore">
              Explore More
            </a>
          </div>

          <div className="note">
            <span>✓</span> Designed for your campus community
          </div>
        </div>

        {/* ILLUSTRATION */}
        <div className="illustration">

          <div className="sun"></div>

          <div className="magnifier">
            <div className="glass"></div>
            <div className="handle"></div>
          </div>

          <div className="pin">
            <div></div>
          </div>

          <span className="sparkle s1">✦</span>
          <span className="sparkle s2">✦</span>
          <span className="sparkle s3">✧</span>

          {/* ID CARD */}
          <div className="id-card">
            <div className="id-person">
              <div></div>
            </div>

            <div className="id-text">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>

          {/* BACKPACK */}
          <div className="backpack">
            <div className="bag-handle"></div>

            <div className="bag-body">
              <div className="bag-flap">
                <div className="diamond"></div>
              </div>

              <div className="bag-pocket"></div>
            </div>

            <div className="bag-side"></div>
            <div className="bag-strap"></div>
          </div>

          {/* BOOKS */}
          <div className="books">
            <div className="book book1"></div>
            <div className="book book2"></div>
            <div className="book book3"></div>
          </div>

          <div className="plant left-plant">🌿</div>
          <div className="plant right-plant">🌱</div>

        </div>
      </section>

      {/* FEATURES */}
      <section className="features" id="features">

        <div className="feature-heading">
          <span></span>
          <h2>Our Features</h2>
          <span></span>
        </div>

        <div className="feature-grid">

          <div className="feature-card peach">
            <div className="feature-icon">🔍</div>
            <h3>Report Lost Items</h3>
          </div>

          <div className="feature-card mint">
            <div className="feature-icon">🎁</div>
            <h3>Report Found Items</h3>
          </div>

          <div className="feature-card purple">
            <div className="feature-icon">⚡</div>
            <h3>Smart Search</h3>
          </div>

          <div className="feature-card orange">
            <div className="feature-icon">✦</div>
            <h3>AI Possible Matches</h3>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <h3>CampusLost & AI Found</h3>
        <p>
          Making campus life easier, one item at a time.
        </p>
        <small>
          © 2026 CampusLost. All rights reserved.
        </small>
      </footer>

    </div>
  );
}

export default App;
