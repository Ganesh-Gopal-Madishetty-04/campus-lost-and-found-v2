
import '../styles/Dashboard.css';

function Dashboard({
  onReport,
  onBrowse,
  onMyReports,
  onMatches,
  onNotifications,
  onLogout
}) {
  return (
    <div className="dashboard-page">

      {/* NAVBAR */}
      <nav className="dashboard-navbar">
        <div className="dashboard-logo">
          <span>CL</span>
          CampusLost
        </div>

        <button className="dashboard-logout" onClick={onLogout}>
          ↪ Logout
        </button>
      </nav>

      {/* MAIN CONTENT */}
      <main className="dashboard-content">

        {/* WELCOME */}
        <div className="dashboard-heading">
          <h1>Welcome to Your Dashboard!</h1>
          <p>What would you like to do today?</p>
        </div>

        {/* LOST AND FOUND */}
        <div className="report-container">

          <div className="report-card lost-card">
            <div className="report-illustration">🔍</div>

            <div className="report-details">
              <h2>Lost an Item?</h2>
              <p>
                Lost something on campus? Report it here
                and help others identify your belongings.
              </p>

              <button onClick={() => onReport('Lost')}>
                Report Lost Item →
              </button>
            </div>
          </div>

          <div className="report-card found-card">
            <div className="report-illustration">🎒</div>

            <div className="report-details">
              <h2>Found an Item?</h2>
              <p>
                Found something on campus? Share the
                details and help return it to its owner.
              </p>

              <button onClick={() => onReport('Found')}>
                Report Found Item →
              </button>
            </div>
          </div>

        </div>

        {/* EXPLORE SECTION */}
        <div className="dashboard-section">
          <h2>Explore CampusLost</h2>
          <p>Everything you need in one place.</p>
        </div>

        {/* FOUR FEATURE CARDS */}
        <div className="dashboard-features">

          <div className="dashboard-feature">
            <div className="small-icon">📦</div>
            <h3>Browse Items</h3>
            <p>Search through lost and found items.</p>
            <button onClick={onBrowse}>
              Explore Items →
            </button>
          </div>

          <div className="dashboard-feature">
            <div className="small-icon">📋</div>
            <h3>My Reports</h3>
            <p>View your submitted reports.</p>
            <button onClick={onMyReports}>
              View Reports →
            </button>
          </div>

          <div className="dashboard-feature">
            <div className="small-icon">✨</div>
            <h3>AI Possible Matches</h3>
            <p>Discover possible matches for reported items.</p>
            <button onClick={onMatches}>
              View Matches →
            </button>
          </div>

          <div className="dashboard-feature">
            <div className="small-icon">🔔</div>
            <h3>Notifications</h3>
            <p>Stay updated about your reports.</p>
            <button onClick={onNotifications}>
              View Notifications →
            </button>
          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="dashboard-footer">
        <h3>CampusLost & AI Found</h3>
        <p>Making campus life easier, one item at a time.</p>
        <small>© 2026 CampusLost. All rights reserved.</small>
      </footer>

    </div>
  );
}

export default Dashboard;
