# Frontend Guide for Beginners

This guide explains the frontend code of the Employee Management System from start to finish. It assumes you know a little JavaScript but are new to React. Each section first explains the idea, then shows where it appears in this project.

You don't need to read the code first. Read the sections in order, then open the files to see the ideas in use.

## Part 1: The big picture

A **frontend** is the part of an app that people see and click. This app is a **single-page application (SPA)**: the browser loads one HTML page once, and React changes what is shown without reloading the page.

The frontend does not store employee data itself. It asks the **backend** (a separate Spring Boot server at `http://localhost:8080/api`) for data, shows it, and sends changes back.

```
  Browser (React app, port 3000)                 Backend (Spring Boot, port 8080)
  ┌──────────────────────────────┐   HTTP     ┌──────────────────────────────┐
  │ Pages show data and forms    │ ─────────► │ Reads and writes database    │
  │ Login stores a token         │ ◄───────── │ Checks the token             │
  └──────────────────────────────┘   JSON     └──────────────────────────────┘
```

## Part 2: Key React ideas

Before reading the code, learn these terms. Each one appears many times in the project.

### Components

A **component** is a JavaScript function that returns some HTML-like markup. React calls it a *component*, and the markup is written in **JSX**.

```jsx
const Greeting = () => {
  return <h1>Hello, Ravi</h1>;
};
```

Components can be used inside other components, like LEGO bricks. In this project, `App` uses `Navigation`, `EmployeeList` uses `Link`, and so on.

### JSX

JSX looks like HTML but lives inside JavaScript. Two differences from plain HTML:

- Use `className` instead of `class`.
- Use `{ }` to put a JavaScript value into the markup:

```jsx
<p className="name">Welcome, {user}</p>
```

### Props

**Props** are values passed into a component, like function arguments:

```jsx
<ProtectedRoute>
  <div>...</div>
</ProtectedRoute>
```

Here, `ProtectedRoute` receives the `<div>` as its `children` prop.

### State with `useState`

**State** is data that belongs to a component and can change over time. When state changes, React redraws the component.

```jsx
const [loading, setLoading] = useState(true);   // current value, function to change it
setLoading(false);                              // triggers a redraw
```

### Side effects with `useEffect`

`useEffect` runs code *after* a component is drawn. The most common use is loading data when a page opens:

```jsx
useEffect(() => {
  fetchEmployees();
}, []);   // [] means "run once, when the page first appears"
```

### Navigation (routes)

A **route** maps a URL path to a component. React Router decides which component to show:

```jsx
<Route path="/employees" element={<EmployeeList />} />
```

When the URL is `/employees`, the `EmployeeList` component appears.

### Context

**Context** shares data with many components without passing it through every level. This project uses one context for sign-in state (`AuthContext`). Any component can read it with `useAuth()`.

### Promises and `async` / `await`

Calls to the backend take time. `async` functions and `await` let you write them top to bottom:

```js
const response = await employeeAPI.getAll();   // waits for the server
setEmployees(response.data.data);              // runs after the answer arrives
```

If the server fails, the code jumps to the `catch` block.

## Part 3: The starting point

### `public/index.html`

This is the only HTML page. It contains an empty `<div id="root">`. React draws the whole app inside that div.

### `src/index.js`: the entry point

```jsx
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

In plain words: "Find the `root` div, and draw the `App` component inside it." `StrictMode` is a development helper that warns about common mistakes. It doesn't change how the app works in production.

It also loads `styles/index.css`, which applies to the whole app.

## Part 4: The app shell and routing

### `src/App.js`

`App` sets up three things, from outside in:

```jsx
<AuthProvider>            // 1. sign-in state for the whole app
  <Router>                 // 2. URL-based navigation
    <Routes>
      <Route path="/login" element={<Login />} />      // 3a. public page
      <Route path="/*" element={<ProtectedLayout />} /> // 3b. everything else
    </Routes>
  </Router>
</AuthProvider>
```

- `/login` shows the `Login` page with no navigation bar.
- Every other URL goes to `ProtectedLayout`, which only appears for signed-in users.

`ProtectedLayout` draws the navigation bar, a "permission denied" banner (when needed), and an inner set of routes for the pages:

| URL | Component |
|-----|-----------|
| `/` and `/employees` | `EmployeeList` |
| `/employees/add` | `EmployeeForm` |
| `/employees/edit/:id` | `EmployeeForm` (the `:id` is read from the URL) |
| `/departments` | `DepartmentList` |
| `/departments/add` | `DepartmentForm` |
| `/departments/edit/:id` | `DepartmentForm` |

### `src/components/ProtectedRoute.js`

A guard. It checks whether the user is signed in:

- Signed in: it shows the page it wraps (`children`).
- Not signed in: it sends the user to `/login` and remembers where they wanted to go.

```jsx
if (!isAuthenticated) {
  return <Navigate to="/login" replace state={{ from: location }} />;
}
return children;
```

## Part 5: Signing in

### `src/context/AuthContext.js`: the sign-in brain

This file holds the answer to "who is signed in?" and makes it available to the whole app.

Its main pieces:

1. **State:** `session` holds the token and username, or `null` when signed out. It starts with the saved session from the browser's storage.
2. **`login(username, password)`:** calls the backend, saves the token, and updates `session`.
3. **`logout()`:** clears the saved session and sets `session` to `null`.
4. **Automatic logout:** reads the expiry time from the token and sets a timer to log out at that moment.
5. **Handlers:** tells the API layer what to do on 401 (sign out) and 403 (show a notice).
6. **`useAuth()`:** a shortcut that any component can call to read this data.

`AuthProvider` wraps the app. Components read the value with:

```js
const { user, isAuthenticated, logout } = useAuth();
```

### `src/services/authService.js`: storing the token

The token is kept in the browser's `localStorage`, which survives page refreshes.

A **JWT** (JSON Web Token) is a long string with three parts separated by dots: `header.payload.signature`. The middle part, the payload, is Base64-encoded JSON that contains an `exp` field (expiry time in seconds). This file decodes that part to check whether the token has expired.

Important: decoding the payload does not check the signature. The backend does that. The frontend only uses the expiry time to decide when to sign out.

### `src/pages/Login.js`: the sign-in page

Step by step:

1. The form uses **Formik** to track the username and password fields and **Yup** to check them (both required).
2. On submit, it calls `login(...)` from the auth context.
3. If the sign-in works, `isAuthenticated` becomes `true`, and the component returns `<Navigate to={from} />`. This sends the user to the page they originally wanted, or to `/employees`.
4. If it fails, `getLoginErrorMessage` picks a message:
   - No response at all: "Unable to reach the server."
   - 401 or 403: "Invalid username or password."
   - Anything else: "Login failed. Please try again."

## Part 6: Talking to the backend

### `src/services/api.js`: one place for all requests

This file creates an **Axios** client, a helper for making HTTP requests, with the base URL `http://localhost:8080/api`.

It contains:

- **Endpoint functions** like `employeeAPI.getAll()` that call a specific URL. Components use these instead of writing URLs themselves.
- **Request interceptor:** a function that runs before every request and adds the `Authorization: Bearer <token>` header.
- **Response interceptor:** a function that runs after every response. If the status is 401 (and the request is not the login request), it signs the user out. If it's 403, it shows the permission notice.

So a page can just write `employeeAPI.getAll()`, and the token is attached automatically.

## Part 7: The pages

The four data pages follow the same pattern, so learn one and the rest are easy.

### `src/pages/EmployeeList.js`: showing a list

1. **State:** `employees` (the list), `searchTerm`, `loading`, and `error`.
2. **Load on open:** `useEffect` calls `fetchEmployees()` once, when the page appears.
3. **Fetch:** `employeeAPI.getAll()` returns the server's answer. The list is in `response.data.data`. The `data` wrapper comes from the backend's response format.
4. **Show:** the code draws one table row per employee with `employees.map(...)`.
5. **Search:** the form calls `employeeAPI.search(term)`. The Reset button clears the box and reloads everything.
6. **Edit:** `navigate('/employees/edit/' + id)` changes the page to the edit form.
7. **Delete:** asks `window.confirm`, calls `employeeAPI.delete(id)`, then reloads the list.

While the data loads, the page shows "Loading employees...". If the request fails, an error message appears above the list. If the list is empty, the page shows "No employees found".

### `src/pages/EmployeeForm.js`: adding and editing

This page does both jobs. The URL decides which:

- `/employees/add`: `id` is missing, so the form starts empty and calls `create`.
- `/employees/edit/5`: `id` is `5`, so the form loads that employee first and calls `update`.

Parts of the file:

1. **Validation rules:** a Yup schema says what each field must look like (for example, email must be a valid email, and salary must be a positive number).
2. **Department dropdown:** the page loads all departments so the user can pick one from a `<select>`.
3. **Loading an existing record:** `formik.setValues(...)` fills the form with the employee's data.
4. **Formik:** `useFormik` manages the values, the errors, and what happens on submit. Each input is wired up with `formik.getFieldProps('name')`.
5. **Submit:** on success, `navigate('/employees')` goes back to the list. On failure, an error message is shown.

### `src/pages/DepartmentList.js` and `src/pages/DepartmentForm.js`

These work the same way as the employee pages, with simpler fields: a name and a description. The department form has only two inputs and no dropdown.

## Part 8: The navigation bar

### `src/components/Navigation.js`

This component draws the top bar:

- `Link` components change the page without reloading (they're the React version of `<a href>`).
- It reads `user` and `logout` from `useAuth()` to show the username and a Logout button.
- Clicking Logout calls `logout()`. The auth state becomes `null`, so `ProtectedRoute` sends the user to `/login`.

## Part 9: Styles

Each component imports a CSS file, for example `import '../styles/Form.css';`. Styles are shared by class name, so a class such as `form-container` works in any file that uses it.

| File | Used for |
|------|----------|
| `index.css` | Base styles for the whole page |
| `App.css` | Layout of the main container |
| `Navigation.css` | Top bar and buttons in it |
| `List.css` | Tables and search boxes |
| `Form.css` | Forms, inputs, and error messages |
| `Login.css` | The login page |

## Part 10: The full journey (one example)

Here is what happens when a user adds a department.

1. The user opens `http://localhost:3000`. `index.js` draws `App`.
2. `App` sets up auth and the router. The URL is `/`, which matches `ProtectedLayout`.
3. `ProtectedRoute` checks the auth state. There is no session, so it redirects to `/login`.
4. The user signs in. `login()` calls the backend, saves the token, and updates the auth state.
5. `Login` sees `isAuthenticated` is now `true`, and navigates to `/employees`.
6. The navigation bar appears with the username. `EmployeeList` loads its data, and the backend answers with the list.
7. The user clicks "Departments", which changes the URL to `/departments`. `DepartmentList` loads its data.
8. The user clicks "+ Add Department", which goes to `/departments/add`. `DepartmentForm` appears with empty fields.
9. The user types a name and clicks save. Formik checks the fields with Yup. If they pass, `departmentAPI.create(values)` sends the data. The request includes the token, added by the interceptor in `api.js`.
10. The backend saves the record and replies. The form navigates back to `/departments`, and the list shows the new department.

If the token had expired at step 9, the backend would reply 401. The response interceptor would sign the user out, and `ProtectedRoute` would send them back to `/login`.

## Part 11: Glossary

| Term | Plain meaning |
|------|---------------|
| Component | A function that returns markup; the building block of React |
| JSX | HTML-like syntax inside JavaScript |
| Props | Values passed into a component |
| State | Data that belongs to a component and triggers a redraw when it changes |
| Hook | A function starting with `use` (such as `useState`) that adds React features |
| Effect | Code run after drawing, usually to load data |
| Route | A rule that maps a URL to a component |
| Context | A way to share data across the whole app |
| Formik | A library that manages form values, errors, and submission |
| Yup | A library for describing and checking form rules |
| Axios | A library for making HTTP requests |
| Interceptor | A function that runs on every request or response |
| JWT | A signed token that proves who the user is |
| localStorage | Browser storage that persists after a page refresh |
| SPA | Single-page app: one HTML page, with content changed by JavaScript |

## Part 12: Where to go next

1. Change a text label in `Navigation.js` and watch the page update. This shows how a component renders.
2. Add a console message in `fetchEmployees` and open the browser's developer tools (F12) to see when it runs.
3. Add a new field to the department form, such as "location", following the pattern in `DepartmentForm.js`.
4. Read [AUTHENTICATION.md](AUTHENTICATION.md) for more detail on sign-in.

For how the whole system fits together, see the project documentation at the root of the workspace.
