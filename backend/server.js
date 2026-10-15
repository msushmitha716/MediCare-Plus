require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve the frontend folder as static files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Simple health-check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'MediCare+',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`MediCare+ server running at http://localhost:${PORT}`);
});