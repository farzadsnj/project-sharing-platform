// src/components/ProjectFilter.js
import React, { useState } from 'react';
import axios from 'axios';

function ProjectFilter() {
  const [tag, setTag] = useState('');
  const [category, setCategory] = useState('');
  const [projects, setProjects] = useState([]);

  const handleSearch = () => {
    axios.get('https://localhost:5000/projects/search', {
      params: { tag, category }
    })
    .then(response => {
      setProjects(response.data);
    })
    .catch(error => {
      console.error('Error fetching projects:', error);
    });
  };

  return (
    <div>
      <h2>Search Projects</h2>
      <input 
        type="text" 
        placeholder="Tag" 
        value={tag} 
        onChange={(e) => setTag(e.target.value)} 
      />
      <input 
        type="text" 
        placeholder="Category" 
        value={category} 
        onChange={(e) => setCategory(e.target.value)} 
      />
      <button onClick={handleSearch}>Search</button>

      <div>
        {projects.map(project => (
          <div key={project._id}>
            <h3>{project.title}</h3>
            <p>{project.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProjectFilter;
