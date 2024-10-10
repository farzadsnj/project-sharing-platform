import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

function VerifyMFA() {
  const [mfaToken, setMfaToken] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = location.state;

  const handleSubmit = (e) => {
    e.preventDefault();

    axios.post('https://localhost:5000/verify-mfa', { userId, mfaToken })
      .then((response) => {
        localStorage.setItem('token', response.data.token);
        alert('MFA verification successful!');
        navigate('/dashboard');  // Redirect to dashboard on successful verification
      })
      .catch((error) => {
        setError('Invalid MFA token');
        console.error('MFA verification error:', error);
      });
  };

  return (
    <div className="verify-mfa-container">
      <h2>MFA Verification</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Enter MFA Token:</label>
          <input 
            type="text"
            value={mfaToken}
            onChange={(e) => setMfaToken(e.target.value)}
            required
          />
        </div>
        <button type="submit">Verify</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
}

export default VerifyMFA;
