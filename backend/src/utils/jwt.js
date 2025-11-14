import jwt from 'jsonwebtoken';

const DEFAULT_EXPIRES_IN = '7d';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.warn('⚠️  JWT_SECRET is not set. Using an ephemeral dev secret. Do not use in production.');
    return 'dev-secret-change-me';
  }
  return secret;
}

export function signAuthToken(payload, options = {}) {
  const secret = getJwtSecret();
  const expiresIn = options.expiresIn || process.env.JWT_EXPIRES_IN || DEFAULT_EXPIRES_IN;
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyAuthToken(token) {
  const secret = getJwtSecret();
  return jwt.verify(token, secret);
}

export function extractTokenFromRequest(req) {
  const header = req.headers?.authorization ||  req.query.token || req.cookies.token || '';
  if (header.startsWith('Bearer ')) {
    return header.slice(7);
  }
  return null;
}


