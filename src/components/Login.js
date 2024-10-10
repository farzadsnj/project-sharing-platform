import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    axios.post('https://localhost:5000/login', { email, password })
      .then((response) => {
        if (response.data.mfaRequired) {
          // Navigate to MFA verification if required
          navigate('/verify-mfa', { state: { userId: response.data.userId } });
        } else {
          localStorage.setItem('token', response.data.token);
          alert('Login successful!');
          navigate('/dashboard');  // Redirect to dashboard
        }
      })
      .catch((error) => {
        setError('Invalid email or password');
        console.error('Login error:', error);
      });
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
}

export default Login;
