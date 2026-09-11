export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'CASHIER' | 'CUSTOMER';
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
}

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * Set a cookie in document.cookie with security flags
 */
function setCookie(name: string, value: string, maxAgeSeconds: number = COOKIE_MAX_AGE) {
  if (typeof document === 'undefined') return;
  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax${isSecure ? '; Secure' : ''}`;
}

/**
 * Delete a cookie by expiring it
 */
function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}

/**
 * Get cookie value by name in browser
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

/**
 * Persist authenticated session into both localStorage and secure document cookies
 */
export function saveAuthSession(session: { accessToken: string; refreshToken?: string; user: AuthUser }) {
  if (typeof window === 'undefined') return;

  // LocalStorage
  localStorage.setItem('access_token', session.accessToken);
  if (session.refreshToken) {
    localStorage.setItem('refresh_token', session.refreshToken);
  }
  localStorage.setItem('user', JSON.stringify(session.user));

  // Cookies (read by Next.js Edge Middleware)
  setCookie('access_token', session.accessToken);
  setCookie('user_role', session.user.role);
  setCookie('user_id', session.user.id);
  setCookie('user_email', session.user.email);
}

/**
 * Clear authentication session from localStorage and delete cookies
 */
export function clearAuthSession() {
  if (typeof window === 'undefined') return;

  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');

  deleteCookie('access_token');
  deleteCookie('user_role');
  deleteCookie('user_id');
  deleteCookie('user_email');
}

/**
 * Retrieve active authentication session safely from client storage
 */
export function getStoredAuth(): { token: string | null; user: AuthUser | null } {
  if (typeof window === 'undefined') {
    return { token: null, user: null };
  }

  const token = localStorage.getItem('access_token') || getCookie('access_token');
  const userJson = localStorage.getItem('user');

  if (!userJson) {
    return { token: null, user: null };
  }

  try {
    const user = JSON.parse(userJson) as AuthUser;
    if (!user || !user.role) {
      return { token: null, user: null };
    }
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}
