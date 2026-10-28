const TOKEN_KEY = 'authToken';
const USERNAME_KEY = 'authUsername';

// Reads the exp claim (seconds since epoch) from a JWT and returns it in ms.
// Returns null if the token is not a decodable JWT.
export const getTokenExpiry = (token) => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const { exp } = JSON.parse(atob(base64));
    return exp ? exp * 1000 : null;
  } catch {
    return null;
  }
};

export const isTokenExpired = (token) => {
  const expiry = getTokenExpiry(token);
  return expiry !== null && expiry <= Date.now();
};

export const saveSession = (token, username) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USERNAME_KEY, username);
};

export const clearStoredSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
};

// Returns the saved session, or null if there is none or the token has expired.
export const getStoredSession = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  const username = localStorage.getItem(USERNAME_KEY);

  if (!token || !username || isTokenExpired(token)) {
    clearStoredSession();
    return null;
  }

  return { token, username };
};

export const getToken = () => getStoredSession()?.token ?? null;
