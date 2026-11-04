# Authentication (JWT)

The frontend signs users in against the backend and sends a JWT with every API request. This document covers how that works, where the code lives, and how to test it.

## Overview

- The backend exposes `POST /api/v1/auth/login`. It takes `{ "username", "password" }` and returns `{ "token", "username" }`.
- Tokens expire after 24 hours (86400000 ms).
- Every endpoint except `/v1/auth/login` requires `Authorization: Bearer <token>`.
- The frontend stores the token and username in `localStorage`, so a session survives a page refresh.

## Flow

1. The user opens any page. `ProtectedRoute` checks whether a valid session exists. If not, it redirects to `/login` and remembers the page the user wanted.
2. The user submits the login form. `AuthContext.login()` calls `authAPI.login()`.
3. On success, the token and username are saved to `localStorage` and placed in React state. The user is redirected back to the original page, or to `/employees`.
4. Every API request goes through a request interceptor, which adds the `Authorization` header when a valid token exists.
5. If the backend returns:
   - **401** on any request other than login, the session is cleared and the user is sent to `/login`.
   - **403**, a "You don't have permission to perform this action" banner appears at the top of the page. The user can dismiss it.
6. The session also ends automatically when the token's `exp` time is reached.
7. Logout (the button in the navigation bar) clears the stored session and returns the user to `/login`.

## Files

| File | Purpose |
|------|---------|
| [src/services/authService.js](src/services/authService.js) | Reads, writes, and clears the session in `localStorage`. Decodes the JWT `exp` claim and checks expiry. |
| [src/services/api.js](src/services/api.js) | Axios instance. Request interceptor adds the token. Response interceptor handles 401 and 403. Defines `authAPI.login`. |
| [src/context/AuthContext.js](src/context/AuthContext.js) | `AuthProvider` and `useAuth()`. Holds `user`, `isAuthenticated`, `login`, `logout`, and the permission-denied state. Schedules automatic logout at token expiry. |
| [src/components/ProtectedRoute.js](src/components/ProtectedRoute.js) | Redirects unauthenticated users to `/login`. |
| [src/pages/Login.js](src/pages/Login.js) | Login form with validation and error messages. |
| [src/styles/Login.css](src/styles/Login.css) | Styles for the login page. |
| [src/components/Navigation.js](src/components/Navigation.js) | Shows the logged-in username and a Logout button. |
| [src/App.js](src/App.js) | Routing. `/login` is public. All other routes sit under `ProtectedLayout`, which shows the 403 banner. |

## Routing

```
/login            -> Login (public)
/* (everything else) -> ProtectedLayout
    ├── Navigation
    ├── 403 banner (when permissionDenied)
    └── routes: /, /employees, /employees/add, /employees/edit/:id,
                /departments, /departments/add, /departments/edit/:id
```

## Using auth in components

```js
import { useAuth } from '../context/AuthContext';

const { user, isAuthenticated, login, logout } = useAuth();
```

API calls need no changes. Use `employeeAPI` and `departmentAPI` as before; the token is attached automatically.

## Configuration

| Setting | Location | Current value |
|---------|----------|---------------|
| API base URL | `API_BASE_URL` in [src/services/api.js](src/services/api.js) | `http://localhost:8080/api` |
| localStorage keys | `TOKEN_KEY`, `USERNAME_KEY` in [src/services/authService.js](src/services/authService.js) | `authToken`, `authUsername` |
| Default landing page after login | `from` fallback in [src/pages/Login.js](src/pages/Login.js) | `/employees` |

## Running and testing

1. Start the backend on port 8080.
2. From the `frontend` folder, start the app:
   ```
   npm.cmd install
   npm.cmd start
   ```
   On PowerShell, `npm.cmd` avoids the execution-policy error on `npm.ps1`.
3. Open http://localhost:3000. You should be redirected to `/login`.
4. Sign in with a backend account, for example `admin` / `admin123` or `user` / `user123`.

Scenarios to check:

- Wrong password shows "Invalid username or password."
- With the backend stopped, the login form shows "Unable to reach the server."
- After login, refreshing the page keeps the session.
- Logout clears the session and returns to `/login`.
- Visiting a protected page after logout redirects to `/login`.
- A token that expires (or a 401 from the backend) logs the user out.
- A 403 from the backend shows the permission banner.

Production build check:

```
npm.cmd run build
```

## Assumptions and limitations

- The login response is read as `response.data.token` and `response.data.username`, with no `data` wrapper. If the backend wraps it, update `login()` in [src/context/AuthContext.js](src/context/AuthContext.js).
- Tokens are stored in `localStorage`. Any script running on the page can read them, so an XSS vulnerability would expose the token. An `HttpOnly` cookie would be safer but requires backend changes and CORS credentials.
- There is no token refresh. When the token expires, the user must log in again.
- There is no role-based UI. Access to specific actions is enforced by the backend, and the frontend only reacts to 403 responses.
- The `/` route and `/employees` both show the employee list. There is no separate dashboard.
- The login page has no "remember me" option.
