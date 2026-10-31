import { useState } from 'react';
import '../styles/Report.css';

function Report({ type, onBack, onSubmit }) {
  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    location: '',
    date: '',
    photo: null
  });

  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState('');

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  function handlePhotoChange(e) {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      e.target.value = '';
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setForm({
      ...form,
      photo: file
    });

    setPreview(URL.createObjectURL(file));
  }

  function handleSubmit(e) {
    e.preventDefault();

    const newReport = {
      id: Date.now(),
      name: form.title.trim(),
      type: type,
      category: form.category,
      description: form.description.trim(),
      location: form.location.trim(),
      date: form.date,
      photoUrl: form.photo ? URL.createObjectURL(form.photo) : '',
      status: 'Pending'
    };

    onSubmit(newReport);
    setSuccess(true);
  }

  return (
    <div className="report-page">
      <div className="report-box">
        <button className="back-btn" onClick={onBack}>
          ← Back to Dashboard
        </button>

        <h1>Report {type} Item</h1>
        <p>Provide the details of the item below.</p>

        {success ? (
          <div className="report-success">
            <h2>✓ Report Submitted Successfully!</h2>
            <p>
              Your {type.toLowerCase()} item report has been added.
            </p>

            <button type="button" onClick={onBack}>
              Back to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label>Item Name</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter item name"
              required
            />

            <label>Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >
              <option value="">Select category</option>
              <option value="Electronics">Electronics</option>
              <option value="ID Cards">ID Cards</option>
              <option value="Books & Notes">Books & Notes</option>
              <option value="Bags">Bags</option>
              <option value="Sports">Sports</option>
              <option value="Other">Other</option>
            </select>

            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the item"
              required
            />

            <label>Location</label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Where was it lost or found?"
              required
            />

            <label>Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />

            <label>Upload Photo (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
            />

            {preview && (
              <div className="photo-preview">
                <p>Photo Preview:</p>
                <img src={preview} alt="Selected item preview" />
              </div>
            )}

            <button type="submit">Submit Report</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Report;