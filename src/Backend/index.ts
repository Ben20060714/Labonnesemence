import express from 'express';
import cors from 'cors';
import path from 'path';

import { initializeDatabase } from './models/database.ts';
import { cleanExpiredRefreshTokens } from './utils/jwt.ts';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.ts';

import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import postsRoutes from './routes/posts.routes.js';
import filesRoutes from './routes/files.routes.js';
import { spawn } from 'child_process';

const dir = import.meta.dirname;
const app = express();
const PORT = process.env.PORT || 5000;
const projectRoot = path.resolve(dir, '..', '..');
const VITE_PORT = process.env.VITE_PORT || 3000;
const viteUrl = process.env.VITE_DEV_SERVER_URL || `http://localhost:${VITE_PORT}`;
let viteProcess = null;

// ---- fonction start viteServer pour démarrer le serveur Vite ----
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

  viteProcess.on('error', (error: any) => {
    viteProcess = null;
    console.error('Failed to start Vite server:', error);
  });

  viteProcess.on('exit', () => {
    viteProcess = null;
  });

  viteProcess.unref();

  return true;
};

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ─── Initialize DB ──────────────────────────────────────────────────────────
initializeDatabase();

// ─── Clean expired tokens every hour ────────────────────────────────────────
setInterval(cleanExpiredRefreshTokens, 60 * 60 * 1000);

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/health', (_req: any, res: any) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// ─── API Routes ──────────────────────────────────────────────────────────────
app.get('/', (req: any, res: any) => {
  startViteServer();
  res.redirect(viteUrl);
});

app.get('/start-vite', (req: any, res: any) => {
  const started = startViteServer();

  res.status(202).json({
    message: started ? 'Vite server started.' : 'Vite server is already running.',
    url: viteUrl
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/files', filesRoutes);

// ─── Error handling ──────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Start server ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n Server running on http://localhost:${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/health`);
  console.log(`\nAvailable routes:`);
  console.log(`  POST   /api/auth/register`);
  console.log(`  POST   /api/auth/login`);
  console.log(`  POST   /api/auth/refresh`);
  console.log(`  POST   /api/auth/logout`);
  console.log(`  GET    /api/auth/me`);
  console.log(`  PATCH  /api/auth/password`);
  console.log(`  GET    /api/users            (admin)`);
  console.log(`  POST   /api/users            (admin)`);
  console.log(`  GET    /api/users/:id`);
  console.log(`  PUT    /api/users/:id`);
  console.log(`  DELETE /api/users/:id`);
  console.log(`  GET    /api/posts`);
  console.log(`  GET    /api/posts/admin`);
  console.log(`  POST   /api/posts`);
  console.log(`  GET    /api/posts/:slug`);
  console.log(`  PUT    /api/posts/:id`);
  console.log(`  DELETE /api/posts/:id`);
  console.log(`  PATCH  /api/posts/:id/publish`);
  console.log(`  PATCH  /api/posts/:id/unpublish`);
  console.log(`  GET    /api/files`);
  console.log(`  POST   /api/files/upload`);
  console.log(`  POST   /api/files/upload-multiple`);
  console.log(`  GET    /api/files/:id/info`);
  console.log(`  GET    /api/files/:id/download`);
  console.log(`  GET    /api/files/:id/stream`);
  console.log(`  PATCH  /api/files/:id/visibility`);
  console.log(`  DELETE /api/files/:id\n`);
});

export default app;

