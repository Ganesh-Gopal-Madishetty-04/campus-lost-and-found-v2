
import { useState } from 'react';
import '../styles/Login.css';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(e) {
    e.preventDefault();

    if (email.trim() && password.trim()) {
      onLogin();
    }
  }

  return (
    <div className="login-page">

      <div className="login-card">

        <div className="login-logo">
          <span>CL</span>
        </div>

        <h1>Welcome Back!</h1>

        <p className="login-subtitle">
          Login to your CampusLost account
        </p>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>College Email</label>

            <input
              type="email"
              placeholder="Enter your college email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-button">
            Login to Account
          </button>

        </form>

        <div className="login-footer">
          <p>
            CampusLost & AI Found
          </p>
          <span>Making campus life easier, one item at a time.</span>
        </div>

      </div>

    </div>
  );
}

export default Login;
