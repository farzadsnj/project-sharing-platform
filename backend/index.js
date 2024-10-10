const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/project-sharing', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Define User schema and model
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', UserSchema);

// Define Project schema and model
const ProjectSchema = new mongoose.Schema({
  title: String,
  description: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const Project = mongoose.model('Project', ProjectSchema);

// Register route
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  try {
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();
    res.json({ message: 'User registered successfully!' });
  } catch (err) {
    res.status(400).json({ message: 'Error registering user', error: err });
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign({ userId: user._id }, 'secretkey', { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(400).json({ message: 'Invalid credentials' });
  }
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Access denied' });

  jwt.verify(token, 'secretkey', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Route to add a new project (only for authenticated users)
app.post('/projects', authenticateToken, async (req, res) => {
  const { title, description } = req.body;
  const newProject = new Project({
    title,
    description,
    owner: req.user.userId,
  });

  try {
    await newProject.save();
    res.status(201).json(newProject);
  } catch (err) {
    res.status(400).json({ message: 'Error creating project', error: err });
  }
});

// Route to fetch projects for the authenticated user
app.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user.userId });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching projects', error: err });
  }
});

// Route to fetch all projects (public)
app.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find().populate('owner', 'email');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching projects', error: err });
  }
});

// Route to fetch project details by ID
app.get('/projects/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('owner', 'email');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching project details', error: err });
  }
});

// Start the server
app.listen(5000, () => {
  console.log('Server running on port 5000');
});
