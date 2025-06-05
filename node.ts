/**
 * index.ts
 */

import path from 'path';
import express, { Request, Response } from 'express';
import session from 'express-session';
import proxy from 'express-http-proxy';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

/**
 * Replace these with your real values:
 */
const SECRET_KEY = process.env.MAKE_BRIDGE_API_SECRET;
const KEY_ID = process.env.MAKE_BRIDGE_API_KEY_ID;
const PORTAL_URL = 'https://eu2.make.com';

const app = express();

/**
 * Basic session configuration.
 * In a real application, you'd store `secret` in an env variable.
 */
app.use(
  session({
    secret: 'some_secret_value',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(express.static(path.join(__dirname, '../public')));

/**
 * A quick demo route to "log in" and set userId in the session.
 * In a real app, you'd do proper authentication here.
 */
app.get('/login', (req: Request, res: Response) => {
  // For demonstration, set a userId in session
  (req.session as any).userId = 'fakeUserId';
  res.send('Logged in - userId set in session');
});

/**
 * A quick logout route to destroy the session.
 */
app.get('/logout', (req: Request, res: Response) => {
  req.session?.destroy(() => {
    res.send('Logged out - session destroyed');
  });
});

/**
 * A single middleware that handles:
 *   - Authorization check (via 'filter')
 *   - JWT generation (via 'proxyReqOptDecorator')
 *   - Request forwarding
 */

// eu1.make.com/portal/api/bridge/integrations/6546/run-once

app.use(
  '/proxy',
  proxy(PORTAL_URL, {
    filter: (req, res) => {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        // If no userId in session, block the proxy call
        res.status(401).json({ error: 'Unauthorized' });
        return false;
      }
      return true;
    },
    proxyReqPathResolver: (req) => {
      // Strip out "/proxy" from the path before forwarding
      return req.originalUrl.replace(/^/proxy/, '');
    },
    proxyReqOptDecorator: (proxyReqOpts: any, srcReq) => {
      const userId = (srcReq.session as any)?.userId;

      // Generate a fresh JWT for each request
      const token = jwt.sign(
        {
          sub: userId,
          jti: crypto.randomUUID(),
        },
        SECRET_KEY,
        {
          expiresIn: '2m',
          keyid: KEY_ID,
        }
      );

      // Attach the JWT to the Authorization header
      proxyReqOpts.headers['Authorization'] = `Bearer ${token}`;

      return proxyReqOpts;
    },
  })
);

/**
 * Start the server on port 3000 (or any port you prefer).
 */
app.listen(3000, () => {
  console.log('Server is listening on port 3000.');
});