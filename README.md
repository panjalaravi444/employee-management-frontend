# Employee Management System: Frontend

A single-page React application for managing departments and employees. It signs users in with JWT, calls the Spring Boot backend, and provides forms, lists, and search for both kinds of records.

This is the frontend repository. The backend (Spring Boot API) lives in a separate repository.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Routes](#routes)
- [Authentication](#authentication)
- [Configuration](#configuration)
- [Setup Instructions](#setup-instructions)
- [Running the Application](#running-the-application)
- [Default Credentials](#default-credentials)
- [Building for Production](#building-for-production)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Known Limitations](#known-limitations)
- [Further Reading](#further-reading)

## Overview

The app talks to a REST API at `http://localhost:8080/api`. Users sign in with a username and password, receive a JWT, and the app sends that token with every later request. Pages that need a signed-in user redirect to the login page when there is none.

## Tech Stack

| Library | Version (from `package.json`) | Purpose |
|---------|-------------------------------|---------|
| React | 18.2 | UI components |
| React Router DOM | 6.8 | Client-side routing |
| Axios | 1.3 | HTTP client for the backend API |
| Formik | 2.4 | Form state |
| Yup | 0.32 | Form validation |
| React Icons | 4.7 | Icons |
| Create React App (`react-scripts`) | 5.0 | Development server, build, and test tooling |

The code is JavaScript (JSX). There is no TypeScript.

## Features

**Authentication**
- Login page with validation and clear error messages (wrong password, server unreachable)
- Token stored in `localStorage`; the session survives page refresh
- Automatic logout when the token expires
- Automatic logout when the backend returns 401
- A "permission denied" notice when the backend returns 403
- Logout button and the signed-in username in the navigation bar

**Employees**
- List all employees with status (active or inactive)
- Search by name or email, with a Reset button
- Add, edit, and delete employees (delete asks for confirmation)
- Form validation: required fields, name lengths, valid email, positive salary, and a department picker

**Departments**
- List all departments
- Search by name, with a Reset button
- Add, edit, and delete departments (delete asks for confirmation)
- Form validation: name length and description length

## Project Structure

```
frontend/
├── public/
│   └── index.html              # HTML shell
├── src/
│   ├── App.js                  # Routes; protected layout with navigation
│   ├── index.js                # Entry point
│   ├── components/
│   │   ├── Navigation.js       # Top bar: links, username, logout
│   │   └── ProtectedRoute.js   # Redirects signed-out users to /login
│   ├── context/
│   │   └── AuthContext.js      # Sign-in state, login/logout, token expiry
│   ├── pages/
│   │   ├── Login.js
│   │   ├── EmployeeList.js
│   │   ├── EmployeeForm.js     # Add and edit
│   │   ├── DepartmentList.js
│   │   └── DepartmentForm.js   # Add and edit
│   ├── services/
│   │   ├── api.js              # Axios instance, interceptors, endpoint functions
│   │   └── authService.js      # Token storage and expiry check
│   └── styles/                 # One CSS file per area
├── .gitignore
├── AUTHENTICATION.md           # Detailed authentication guide
├── package.json
└── package-lock.json
```

## Routes

| Path | Page | Access |
|------|------|--------|
| `/login` | Login | Public |
| `/` and `/employees` | Employee list | Signed in |
| `/employees/add` | Add employee | Signed in |
| `/employees/edit/:id` | Edit employee | Signed in |
| `/departments` | Department list | Signed in |
| `/departments/add` | Add department | Signed in |
| `/departments/edit/:id` | Edit department | Signed in |

Signed-out users who open a protected page are sent to `/login`. After signing in, they return to the page they asked for.

## Authentication

1. The user submits the login form. The app calls `POST /api/v1/auth/login`.
2. On success, the backend returns `{ "token", "username" }`. Both values are saved in `localStorage` under the keys `authToken` and `authUsername`.
3. An Axios request interceptor adds `Authorization: Bearer <token>` to every API call.
4. A response interceptor signs the user out on a 401 (except for the login call itself) and shows a permission notice on a 403.
5. The app reads the token's `exp` claim and signs the user out when it expires.

The full flow, including how to test each case, is in [AUTHENTICATION.md](AUTHENTICATION.md).

## Configuration

| Setting | File | Default |
|---------|------|---------|
| Backend base URL | `API_BASE_URL` in `src/services/api.js` | `http://localhost:8080/api` |
| Token storage keys | `src/services/authService.js` | `authToken`, `authUsername` |
| Page after login | `from` fallback in `src/pages/Login.js` | `/employees` |

The `proxy` field in `package.json` is set to `http://localhost:8080`. The app uses the absolute base URL above, so the proxy has no effect on API calls. It is left over from setup.

## Setup Instructions

### Prerequisites

- Node.js 14 or newer, with npm
- The backend running on port 8080 (see the backend repository)

### Install dependencies

```bash
cd frontend
npm install
```

On Windows PowerShell, if you see *"running scripts is disabled on this system"*, use `npm.cmd` instead of `npm` for every command in this guide. Alternatively, allow local scripts for your user account once:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

## Running the Application

Start the backend first, then the frontend.

```bash
npm start
```

Open http://localhost:3000. You will be redirected to the login page.

If the backend isn't running, the login page shows *"Unable to reach the server."* and the list pages show *"Failed to fetch"* messages.

## Default Credentials

These accounts are created by the backend on first startup. They are for development only.

| Username | Password | Roles |
|----------|----------|-------|
| `admin` | `admin123` | ADMIN, USER |
| `user` | `user123` | USER |

Change these in any shared or production environment.

## Building for Production

```bash
npm run build
```

The optimized files are written to `build/`. Serve that folder with any static web server. For example:

```bash
npx serve -s build
```

The build must be served over HTTPS in production, because the token is stored in `localStorage`.

## Testing

```bash
npm test
```

This starts the Create React App test runner. The project does not have frontend tests yet. Authentication scenarios are listed as manual checks in [AUTHENTICATION.md](AUTHENTICATION.md).

## Troubleshooting

| Symptom | Likely cause and fix |
|---------|----------------------|
| `npm` fails with "running scripts is disabled" | Use `npm.cmd`, or change the execution policy (see Setup) |
| Login shows "Unable to reach the server" | Backend isn't running on port 8080, or CORS doesn't allow `http://localhost:3000` |
| Browser console shows a CORS error on the first request | The backend must allow `OPTIONS` preflight requests and the origin `http://localhost:3000` |
| Redirected to `/login` after refresh | The token expired (24 hours by default) or was cleared; sign in again |
| "You don't have permission to perform this action" | The backend rejected the request with 403 for the signed-in user |
| `Module not found` after pulling changes | Run `npm install` again |
| Port 3000 in use | Run `set PORT=3001` (Windows) or `PORT=3001 npm start` (macOS/Linux) |

## Known Limitations

- The token is stored in `localStorage`, which any script on the page can read. An `HttpOnly` cookie would be safer but needs backend changes.
- There is no token refresh. When the token expires, the user signs in again.
- The search term is inserted into the URL without encoding, so search text containing `&`, `#`, or `+` may not search correctly.
- Lists load all records; there is no pagination.
- Employee deactivation exists in the backend API but is not in the UI.
- Two forms (`DepartmentForm.js`, `EmployeeForm.js`) show `react-hooks/exhaustive-deps` lint warnings during build. They don't stop the build.
- There are no frontend unit tests yet.

## Further Reading

- [AUTHENTICATION.md](AUTHENTICATION.md): sign-in flow, files, and manual test scenarios
- The project-wide guide (backend, frontend, and API) is in the project documentation at the root of the workspace
