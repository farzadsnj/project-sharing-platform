import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from './components/Login';
import Register from './components/Register'; // Import the Register component
import ProjectList from './components/ProjectList';
import ProjectDetail from './components/ProjectDetail';
import Dashboard from './components/Dashboard';
import Introduction from './components/Introduction';
import NavigationBar from './components/Navbar'; // Import the new Navbar component

function App() {
  return (
    <Router>
      <div>
        {/* Use the NavigationBar component */}
        <NavigationBar />
        
        {/* Routes */}
        <Routes>
          <Route path="/" element={<Introduction />} />  {/* Default to the Introduction */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} /> {/* Add the Register route */}
          <Route path="/projects" element={<ProjectList />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
