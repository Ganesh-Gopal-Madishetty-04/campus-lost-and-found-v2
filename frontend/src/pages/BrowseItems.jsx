import { useState } from 'react';
import '../styles/BrowseItems.css';

function BrowseItems({ onBack, items = [] }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [type, setType] = useState('All');

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === 'All' || item.category === category;

    const matchesType =
      type === 'All' || item.type === type;

    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <div className="browse-page">

      <nav className="browse-navbar">
        <h2>CampusLost</h2>
        <button onClick={onBack}>Dashboard</button>
      </nav>

      <main className="browse-content">

        <h1>Browse Items</h1>
        <p>Search for lost and found items on campus.</p>

        {/* Search */}
        <input
          type="text"
          className="search-input"
          placeholder="Search by item name, description or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Filters */}
        <div className="filter-container">

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="ID Cards">ID Cards</option>
            <option value="Books & Notes">Books & Notes</option>
            <option value="Bags">Bags</option>
            <option value="Sports">Sports</option>
            <option value="Other">Other</option>
          </select>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Lost">Lost Items</option>
            <option value="Found">Found Items</option>
          </select>

        </div>

        {/* Item Count */}
        <div className="browse-count">
          Total Items: {filteredItems.length}
        </div>

        {/* Items */}
        {filteredItems.length > 0 ? (

          <div className="items-container">

            {filteredItems.map((item) => (

              <div className="item-card" key={item.id}>

                <h3>{item.name}</h3>

                {/* Uploaded Photo */}
                {item.photoUrl && (
                  <img
                    src={item.photoUrl}
                    alt={item.name}
                    className="item-photo"
                  />
                )}

                <p>
                  <strong>Type:</strong> {item.type}
                </p>

                <p>
                  <strong>Category:</strong> {item.category}
                </p>

                <p>
                  <strong>Description:</strong> {item.description}
                </p>

                <p>
                  <strong>Location:</strong> {item.location}
                </p>

                <p>
                  <strong>Date:</strong> {item.date}
                </p>

                <p>
                  <strong>Status:</strong> {item.status}
                </p>

              </div>

            ))}

          </div>

        ) : (

          <div className="empty-state">

            <div className="empty-icon">🔍</div>

            <h2>
              {items.length === 0
                ? 'No Items Yet!'
                : 'No Matching Items Found'}
            </h2>

            <p>
              {items.length === 0
                ? 'There are currently no lost or found items reported.'
                : 'Try changing your search or filters.'}
            </p>

          </div>

        )}

      </main>
    </div>
  );
}

export default BrowseItems;