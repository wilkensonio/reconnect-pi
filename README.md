# Reconnect-Pi

A web application for scheduling meetings with faculty members.

## Features

- User Authentication
- Faculty Selection
- Schedule Meetings
- View and Check-In to Meetings
- Responsive Design with Animated Backgrounds
- Error Handling with Custom Error Boundaries

## Technologies Used

- React
- React Router
- Axios
- Vite
- CSS Modules

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/reconnect-pi.git
   ```

2. **Navigate to the project directory:**

   ```bash
   cd reconnect-pi
   ```

3. **Install dependencies:**

   ```bash
   npm install
   ```

## Running the Application

### Development Mode

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### Production Build

Build the app for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Usage

1. **Login:**
   - Open the application in your browser.
   - Use your credentials to log in.
   - Students can scan their IDs using a barcode scanner (on kiosk/hardware).

2. **Select Faculty Member:**
   - Choose a faculty member from the list to view their availability.

3. **Schedule a Meeting:**
   - Select an available date and time.
   - Specify the meeting duration and reason.
   - Confirm the appointment.

4. **View Meetings:**
   - View your upcoming meetings.
   - Check-in to meetings when you arrive.

5. **Logout:**
   - Use the logout button to securely exit the application.

## Project Structure

- 

App.jsx

Main application component with routing and context providers.
- 

components

Reusable components like `Login`, `Schedule`, `Home`, `ErrorBoundary`, etc.
- 

context

Context providers for global state management.
- 

services

API services for handling HTTP requests.
- 

styles

CSS files and styling for the components.
- 

public

Static assets like images and HTML templates.

## Available Scripts

- `npm run dev`: Start the development server.
- `npm run build`: Build the app for production.
- `npm run preview`: Preview the production build.
- `npm run lint`: Run ESLint for code linting.

## Dependencies

Key dependencies include:

- `react`
- `react-dom`
- `react-router-dom`
- `axios`
- `react-datepicker`
- `vite`

For a full list, see 

package.json

.

## Contributing

Contributions are welcome. Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.
