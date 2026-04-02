# Campus Placement Tracker

An interactive React application shell for tracking campus placements, implemented with a custom professional brown color palette (Bistre, Coffee, Chamois, Khaki, and Beige).

## Getting Started

If your development server stops or you need to restart it, follow these steps:

1. Open your terminal.
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Start the development server (Vite):
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Testing to Verify the App

This application shell currently uses simulated application state to demonstrate the layouts and features before the real backend API is integrated. Here is how you can test the application:

### 1. The Welcome / Login Screen
* **Color Palette Check**: You will immediately notice the custom color palette matching the requested professional dark brown aesthetic.
* **Simulated Login**: You can use the following test credentials:
  * **Student**: Email `student@test.com`, Password `any`
  * **Admin**: Email `admin@test.com`, Password `any`
* **JSON Debug Window**: Select a role ("Student" or "Admin"), fill in the test credentials, then click "Login". You'll see a simulated "backend response" in a dark block at the bottom of the screen showing the generated JSON Web Token (JWT) before the view redirects.

### 2. Testing as a "Student"
* On the Login screen, choose **Student** and log in.
* **Dashboard Stats**: You will land on the Student Dashboard. Notice the metrics specific to a student: "Applications" and "Shortlisted". 
* **Sidebar Navigation**: The sidebar limits your actions to Student views. 
* **Drives**: Click "Drives" to see job opportunities. Notice the "Apply Now" button placeholder. 
* **Logout**: Click the Logout button in the top right to return to the Login screen.

### 3. Testing as an "Admin"
* On the Login screen, choose **Admin** and log in.
* **Dashboard Stats**: You will land on the Admin Dashboard. The metrics shift to admin-level stats: "Upcoming Drives", "Total Students", and "Active Companies".
* **Sidebar Navigation**: Notice the expanded navigation menu allowing the Admin to manage "Companies" and "Interviews".
* **Drives**: Click "Drives" again. Notice the "Add New Drive" button and the absence of the student's "Apply Now" buttons.

## Important Note

This is a **Frontend Shell**. There are no external libraries being used (like Bootstrap or Tailwind) and no database connection yet. All styling is pure CSS located in `frontend/src/index.css` and all state is managed using React hooks in `frontend/src/App.jsx`.
