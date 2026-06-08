/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const express = require('express');
const path = require('path');
const { spawn } = require('child_process');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./users.cjs');
const { initDatabase } = require('./db.cjs');

const app = express();
const PORT = process.env.PORT || 5000;
const projectRoot = path.resolve(__dirname, '..', '..');
const VITE_PORT = process.env.VITE_PORT || 3001;
const viteUrl = process.env.VITE_DEV_SERVER_URL || `http://localhost:${VITE_PORT}`;
let viteProcess = null;

const startViteServer = () => {
  if (viteProcess && !viteProcess.killed) {
    return false;
  }

  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

  viteProcess = spawn(npmCommand, ['run', 'dev', '--', '--port', String(VITE_PORT)], {
    cwd: projectRoot,
    stdio: 'ignore',
    detached: true,
    shell: true
  });

  viteProcess.on('error', (error) => {
    viteProcess = null;
    console.error('Failed to start Vite server:', error);
  });

  viteProcess.on('exit', () => {
    viteProcess = null;
  });

  viteProcess.unref();

  return true;
};

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all routes

// --- Routes ---
app.use('/api', userRoutes);

app.get('/page', (req, res) => {
  startViteServer();
  res.redirect(viteUrl);
});

app.get('/start-vite', (req, res) => {
  const started = startViteServer();

  res.status(202).json({
    message: started ? 'Vite server started.' : 'Vite server is already running.',
    url: viteUrl
  });
});

// Start the server
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Authentication service running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database initialization failed:', error);
    process.exit(1);
  });
