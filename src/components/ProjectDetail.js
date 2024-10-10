import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function ProjectDetail() {
  const { id } = useParams();  // Get the project ID from the URL
  const [project, setProject] = useState(null);

  useEffect(() => {
    // Fetch the project details from the backend
    axios.get(`https://localhost:5000/project/${id}`)
      .then((response) => {
        setProject(response.data);
      })
      .catch((error) => {
        console.error('Error fetching project details:', error);
      });
  }, [id]);

  if (!project) return <p>Loading...</p>;

  return (
    <div className="project-detail">
      <h2>{project.title}</h2>
      <p>{project.description}</p>
      <p><strong>Owner:</strong> {project.owner}</p>
      {/* Add more details if necessary */}
    </div>
  );
}

export default ProjectDetail;
