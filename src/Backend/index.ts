import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

import { initializeDatabase } from './models/database.ts';
import { cleanExpiredRefreshTokens } from './utils/jwt.ts';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.ts';

import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import postsRoutes from './routes/posts.routes.js';
import filesRoutes from './routes/files.routes.js';
import sermonsRoutes from './routes/sermons.routes.js';
import eventsRoutes from './routes/events.routes.js';
import contactsRoutes from './routes/contacts.routes.js';
import donationsRoutes from './routes/donations.routes.js';

const dir = import.meta.dirname;
const app = express();
const PORT = process.env.PORT || 5000;
const projectRoot = path.resolve(dir, '..', '..');
const distDir = path.join(projectRoot, 'dist');
const indexHtmlPath = path.join(distDir, 'index.html');

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
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/sermons', sermonsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/donations', donationsRoutes);

// ─── Frontend statique ───────────────────────────────────────────────────────
if (fs.existsSync(indexHtmlPath)) {
  app.use(express.static(distDir));

  app.get('*', (req: any, res: any, next: any) => {
    if (req.path.startsWith('/api/')) {
      next();
      return;
    }

    res.sendFile(indexHtmlPath);
  });
} else {
  app.get('/', (_req: any, res: any) => {
    res.status(503).send('Frontend non compilé. Lancez `npm run build`, puis redémarrez le serveur.');
  });
}

// ─── Error handling ──────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Start server ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n Server running on http://localhost:${PORT}`);
  console.log(` Frontend: ${fs.existsSync(indexHtmlPath) ? `served from ${distDir}` : 'dist not found, run npm run build'}`);
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
  console.log(`  GET    /api/sermons`);
  console.log(`  POST   /api/sermons          (admin)`);
  console.log(`  PUT    /api/sermons/:id      (admin)`);
  console.log(`  DELETE /api/sermons/:id      (admin)`);
  console.log(`  GET    /api/events`);
  console.log(`  POST   /api/events           (admin)`);
  console.log(`  PUT    /api/events/:id       (admin)`);
  console.log(`  DELETE /api/events/:id       (admin)`);
  console.log(`  POST   /api/contacts`);
  console.log(`  GET    /api/contacts         (admin)`);
  console.log(`  DELETE /api/contacts/:id     (admin)`);
  console.log(`  GET    /api/donations/monetbil/config`);
  console.log(`  POST   /api/donations`);
  console.log(`  POST   /api/donations/monetbil/notify`);
  console.log(`  GET    /api/donations        (admin)`);
  console.log(`  PATCH  /api/donations/:id/status (admin)`);
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
