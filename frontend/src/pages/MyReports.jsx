import '../styles/MyReports.css';

function MyReports({ onBack, reports = [] }) {
  return (
    <div className="myreports-page">

      <nav className="myreports-navbar">
        <h2>CampusLost</h2>
        <button onClick={onBack}>Dashboard</button>
      </nav>

      <main className="myreports-content">

        <h1>My Reports</h1>
        <p>Here you can view your submitted lost and found reports.</p>

        {/* Report Count */}
        <div className="reports-count">
          Total Reports: {reports.length}
        </div>

        {/* Report Cards */}
        {reports.length > 0 ? (

          <div className="reports-container">

            {reports.map((report) => (

              <div className="report-card" key={report.id}>

                <h3>{report.name}</h3>

                {/* Uploaded Photo */}
                {report.photoUrl && (
                  <img
                    src={report.photoUrl}
                    alt={report.name}
                    className="item-photo"
                  />
                )}

                <p>
                  <strong>Type:</strong> {report.type}
                </p>

                <p>
                  <strong>Category:</strong> {report.category}
                </p>

                <p>
                  <strong>Description:</strong> {report.description}
                </p>

                <p>
                  <strong>Location:</strong> {report.location}
                </p>

                <p>
                  <strong>Date:</strong> {report.date}
                </p>

                <p>
                  <strong>Status:</strong> {report.status}
                </p>

              </div>

            ))}

          </div>

        ) : (

          <div className="myreports-empty">

            <div className="empty-icon">📋</div>

            <h2>No Reports Yet!</h2>

            <p>
              You have not submitted any lost or found reports yet.
            </p>

            <p>
              Your submitted reports will appear here.
            </p>

          </div>

        )}

      </main>
    </div>
  );
}

export default MyReports;