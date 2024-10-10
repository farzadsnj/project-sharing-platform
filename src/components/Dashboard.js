import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('No authentication token found. Please login again.');
      return;
    }
    
    axios.get('http://localhost:5001/dashboard', {  // Adjusted URL to use HTTP and correct port
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => {
      setProjects(response.data);
    })
    .catch(error => {
      console.error('Error fetching dashboard data:', error);
      if (error.response) {
        setError(`Error: ${error.response.status} - ${error.response.data.message}`);
      } else {
        setError('Network error or server unavailable.');
      }
    });
  }, []);

  return (
    <div>
      <h2>Your Projects</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {projects.map(project => (
          <li key={project._id}>{project.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
