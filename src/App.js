import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from './components/Login';
import Register from './components/Register';
import VerifyMFA from './components/verify-mfa'; // Import the new MFA component
import ProjectList from './components/ProjectList';
import ProjectDetail from './components/ProjectDetail';
import Dashboard from './components/Dashboard';
import Introduction from './components/Introduction';
import NavigationBar from './components/Navbar';

function App() {
  return (
    <Router>
      <div>
        <NavigationBar />
        <Routes>
          <Route path="/" element={<Introduction />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-mfa" element={<VerifyMFA />} /> {/* New MFA route */}
          <Route path="/projects" element={<ProjectList />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
