import type { NextFunction, Request, Response } from 'express';
import { readStaffAccessToken } from '../services/token.js';

export function authenticateStaff(req: Request, res: Response, next: NextFunction): void {
  const header = req.header('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    const principal = readStaffAccessToken(token);
    req.authStaffId = principal.id;
    req.authStaffType = principal.accountType;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired staff access token' });
  }
}
