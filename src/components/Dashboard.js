import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:5000/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => {
      setProjects(response.data);
    })
    .catch(error => {
      console.error('Error fetching dashboard data:', error);
    });
  }, []);

  return (
    <div>
      <h2>Your Projects</h2>
      <ul>
        {projects.map(project => (
          <li key={project._id}>{project.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
