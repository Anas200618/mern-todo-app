TaskFlow - Task Management Web App

TaskFlow is a full-stack task management application built using the MERN stack (MongoDB, Express, React, Node.js). It helps users organize daily tasks with authentication, filtering, and a modern dashboard UI.

Features

Authentication
- User Registration and Login
- JWT-based authentication
- Secure password hashing using bcryptjs

Task Management
- Create, edit, and delete tasks
- Mark tasks as completed
- Add title, description, due date, and category

Dashboard
- Task statistics (Total, Active, Completed, Overdue)
- Clean and responsive UI

Filters & Search
- Filter by status, category, and due date
- Search by title/description
- Sorting (Newest, Oldest, A-Z, Due Date)

Tech Stack
- Frontend: React.js, Tailwind CSS, React Router
- Backend: Node.js, Express.js
- Database: MongoDB (Mongoose)
- Auth: JWT + bcryptjs

Installation & Setup

To get this project running on your local machine, follow these steps:

1. Clone Repository
git clone https://github.com/your-username/taskflow.git
cd taskflow

2. Backend Setup
Navigate to the backend directory and install dependencies:
cd backend
npm install

Create a .env file in the backend directory with the following variables:
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key

Run the backend server:
npm run dev

3. Frontend Setup
Open a new terminal window, navigate to the frontend directory, and install dependencies:
cd ../frontend
npm install

Run the frontend development server:
npm run dev

How to Use the Application

1. Register / Login
- Open the application in your browser.
- Create a new account or log in using existing credentials.
- Upon logging in, you will be directed to the dashboard.

2. Add a Task
- Click New Task.
- Fill in the Title, Description, Due Date, and Category.
- Click Add Task to save.

3. Edit Task
- Click the edit icon on the target task.
- Update the relevant fields.
- Click Save Changes.

4. Mark as Complete
- Click the checkmark button on a task.
- The task will automatically move to the completed section.

5. Delete Task
- Click the delete icon.
- Confirm the deletion.

6. Use Filters & Search
- Search tasks using the top search bar.
- Filter and sort by:
  - Status (Active / Completed)
  - Category
  - Due Date
  - Sorting Dropdown

7. Pagination
- Navigate easily through long task lists using the controls at the bottom of the page.

  
Key Decisions & Architecture

1. JWT Authentication: Utilized JSON Web Tokens for stateless user authentication. This provides scalability and works well with REST APIs, with tokens saved securely in localStorage.
2. Separation of Concerns: Divided backend logic into controllers and routes, isolating endpoints from business logic to keep the application modular.
3. Optimistic UI Updates: Actions like deleting or completing a task update the UI before the server responds, drastically reducing perceived latency. It falls back to a re-fetch if an error is thrown.
4. Custom Notifications: Created a custom useToast hook to ensure consistent, centralized UI notifications without using heavy third-party libraries.
5. Client-Side Filtering & Sorting: Applied useMemo for sorting and filtering tasks to ensure instant responses and reduce unnecessary backend database requests.
6. Tailwind CSS: Selected Tailwind for rapid, responsive UI development and unified design components.

Author

Mansuri Mohammad Anas
Ahmedabad, India
anas18062006@gmail.com

Support
If you like this project, give it a star on GitHub!
