import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function ProjectList() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    // Fetch projects from the backend
    axios.get('http://localhost:5000/projects')
      .then((response) => {
        setProjects(response.data);
      })
      .catch((error) => {
        console.error('Error fetching projects:', error);
      });
  }, []);

  return (
    <div className="project-list">
      <h2>Available Projects</h2>
      <ul>
        {projects.map((project) => (
          <li key={project._id}>
            <Link to={`/project/${project._id}`}>{project.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProjectList;
