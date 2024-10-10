require('dotenv').config();
console.log('ENCRYPTION_KEY:', process.env.ENCRYPTION_KEY);
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const crypto = require('crypto');
const { sendMFAEmail, generateMFAToken, verifyMFAToken } = require('./mfa'); // Import MFA logic
const fs = require('fs');
const https = require('https');
const http = require('http');  // Add HTTP support

const app = express();
app.use(cors());
app.use(express.json());

console.log('Environment variables loaded:', process.env);

// HTTPS server configuration
const sslServer = https.createServer({
  key: fs.readFileSync('../key.pem'),   // Path to your SSL key file
  cert: fs.readFileSync('../cert.pem')  // Path to your SSL certificate file
}, app);

// Listen on HTTPS port 5000
sslServer.listen(5000, () => {
  console.log('Secure server running on port 5000');
});

// HTTP server configuration (without SSL)
const httpServer = http.createServer(app);

// Listen on HTTP port 5001
httpServer.listen(5001, () => {
  console.log('HTTP server running on port 5001');
});

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/project-sharing', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Encryption function for sensitive data
function encryptData(data) {
  const key = process.env.ENCRYPTION_KEY; // Load key from environment variable
  if (!key) throw new Error("ENCRYPTION_KEY is not defined");
  if (!data) throw new Error("Data to encrypt is not defined");
  const iv = crypto.randomBytes(16); // Generate a 16-byte initialization vector
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted; // Store both IV and encrypted data
}

// Decryption function for sensitive data
function decryptData(data) {
  const key = process.env.ENCRYPTION_KEY; // Load key from environment variable
  console.log('Encryption Key:', process.env.ENCRYPTION_KEY);
  const textParts = data.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex'); // Extract IV
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

// Define User schema and model
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mfaEnabled: { type: Boolean, default: false },
  mfaSecret: { type: String }, // Store MFA secret
});

const User = mongoose.model('User', UserSchema);

// Define Project schema and model
const ProjectSchema = new mongoose.Schema({
  title: String,
  description: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const Project = mongoose.model('Project', ProjectSchema);

// Register route with encrypted password and MFA
app.post('/register', async (req, res) => {
  const { email, password, mfaEnabled } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const encryptedPassword = encryptData(hashedPassword);
  console.log('Hashed Password:', hashedPassword);

  try {
    const newUser = new User({ email, password: encryptedPassword, mfaEnabled });
    await newUser.save();

    // If MFA is enabled, generate and send MFA token
    if (mfaEnabled) {
      const mfaToken = generateMFAToken();
      newUser.mfaSecret = mfaToken;
      await newUser.save();
      sendMFAEmail(email, mfaToken);
    }

    res.status(200).json({ message: 'User registered successfully!', userId: newUser._id });
  } catch (err) {
    res.status(400).json({ message: 'Error registering user', error: err });
  }
});

// Login route with MFA check
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    const decryptedPassword = decryptData(user.password);
    if (bcrypt.compareSync(password, decryptedPassword)) {
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

      // If MFA is enabled, send MFA token
      if (user.mfaEnabled) {
        const mfaToken = generateMFAToken();
        user.mfaSecret = mfaToken;
        await user.save();
        sendMFAEmail(user.email, mfaToken);
        return res.status(200).json({ mfaRequired: true, userId: user._id });
      }

      return res.json({ token });
    }
  }
  res.status(400).json({ message: 'Invalid credentials' });
});

app.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user.userId });
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
});

// Verify MFA token
app.post('/verify-mfa', async (req, res) => {
  const { userId, mfaToken } = req.body;
  const user = await User.findById(userId);

  if (user && verifyMFAToken(mfaToken, user.mfaSecret)) {
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    user.mfaSecret = null; // Clear MFA token after verification
    await user.save();
    res.json({ token });
  } else {
    res.status(400).json({ message: 'Invalid MFA token' });
  }
});

// Example: Recommend projects based on user skills
app.get('/recommend-projects', authenticateToken, async (req, res) => {
  const user = await User.findById(req.user.userId);
  const projects = await Project.find();

  // Example project recommendation algorithm based on user skills
  const recommendedProjects = projects.filter(project => {
    let score = 0;
    if (user.skills.includes(project.requiredSkills)) score += 10;
    if (user.pastProjects.includes(project.domain)) score += 5;
    if (user.interests.includes(project.interests)) score += 5;
    return score >= 10; // Threshold for recommendation
  });

  res.json(recommendedProjects);
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Access denied' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}
