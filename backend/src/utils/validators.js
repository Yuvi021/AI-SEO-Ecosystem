export function validateEmail(email) {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  // Basic RFC 5322-like email regex for common cases
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed);
}

export function validatePassword(password) {
  if (typeof password !== 'string') {
    return { valid: false, message: 'Password must be a string.' };
  }
  const pwd = password.trim();
  if (pwd.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters.' };
  }
  if (!/[a-z]/.test(pwd)) {
    return { valid: false, message: 'Password must include a lowercase letter.' };
  }
  if (!/[A-Z]/.test(pwd)) {
    return { valid: false, message: 'Password must include an uppercase letter.' };
  }
  if (!/[0-9]/.test(pwd)) {
    return { valid: false, message: 'Password must include a number.' };
  }
  if (!/[^A-Za-z0-9]/.test(pwd)) {
    return { valid: false, message: 'Password must include a special character.' };
  }
  return { valid: true, message: 'OK' };
}


