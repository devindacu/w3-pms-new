/**
 * Channel Manager Authentication Middleware
 * 
 * Protects internal API endpoints with API key authentication.
 * The CM_API_KEY environment variable is required for non-webhook routes.
 */

import { Request, Response, NextFunction } from 'express';

export function channelManagerAuth(req: Request, res: Response, next: NextFunction): void {
  const apiKey = process.env.CM_API_KEY;

  // If no API key configured, allow all (development mode)
  if (!apiKey) {
    next();
    return;
  }

  const provided =
    req.headers['x-cm-api-key'] as string ||
    req.headers['authorization']?.replace('Bearer ', '') ||
    (req.query['apiKey'] as string);

  if (!provided || provided !== apiKey) {
    res.status(401).json({ error: 'Unauthorized: Invalid or missing CM API key' });
    return;
  }

  next();
}

/**
 * Capture raw request body for webhook signature verification.
 * Must be used BEFORE express.json() for webhook routes.
 */
export function captureRawBody(req: Request & { rawBody?: string }, _res: Response, next: NextFunction): void {
  let rawBody = '';
  req.on('data', (chunk: Buffer) => {
    rawBody += chunk.toString();
  });
  req.on('end', () => {
    req.rawBody = rawBody;
    next();
  });
}
