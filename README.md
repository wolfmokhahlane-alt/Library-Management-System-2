# Library Management System (Full-Stack)
**Course:** Web Application Development (BIWA2110) &bull; **Labtest Assignment**

A full-stack, responsive, and robust Library Management System built with a **React (Vite) Frontend** and an **Express.js RESTful API Backend** connected to a **MySQL** database (configured for standard XAMPP environments).

---

## 📁 Project Architecture & Folder Structure

```text
Library management/
├── backend/
│   ├── config/
│   │   └── db.js               # MySQL connection pool & auto-init helper
│   ├── routes/
│   │   ├── books.js            # Books CRUD endpoints (/books)
│   │   ├── users.js            # Users CRUD & Login endpoints (/users)
│   │   └── transactions.js     # Stock Transactions & History endpoints (/transactions)
│   ├── .env                    # MySQL & server configuration (XAMPP defaults)
│   ├── .env.example            # Environment variables template
│   ├── package.json            # Express, mysql2, cors, dotenv
│   ├── schema.sql              # Database schema & initial seed data
│   └── server.js               # Express app entry point & middleware setup
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AddBookForm.jsx     # Controlled form with validation to add books
│   │   │   ├── BookList.jsx        # Editable book catalogue with Update & Delete
│   │   │   ├── Dashboard.jsx       # Availability table, stats, & low-stock alerts
│   │   │   ├── EditBookModal.jsx   # Modal dialog to update book details
│   │   │   ├── LoginForm.jsx       # Controlled user login with demo credentials
│   │   │   ├── Navbar.jsx          # Responsive navigation bar with active route highlighting
│   │   │   ├── Transactions.jsx    # Borrow/Restock forms & Live History Log
│   │   │   ├── UserForm.jsx        # Controlled form to add/edit users
│   │   │   └── UserManagement.jsx  # Admin view & user management
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # React authentication & session context
│   │   ├── pages/
│   │   │   ├── BookManagementPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── TransactionsPage.jsx
│   │   │   └── UserManagementPage.jsx
│   │   ├── api.js                  # Centralized native Fetch API client
│   │   ├── App.css                 # Clean, responsive styling & badge styles
│   │   ├── App.jsx                 # React Router (4 main views)
│   │   ├── index.css               # Global theme variables & typography
│   │   └── main.jsx                # React root entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## 🛠️ Technology Stack

- **Frontend:**
  - React 18 (JSX, Functional Components)
  - State & Lifecycle Management: React Hooks (`useState`, `useEffect`, `useContext`)
  - Navigation: `react-router-dom` v6
  - API Communication: Native `fetch` API
  - Bundler: Vite
  - Styling: Modern, responsive CSS with glassmorphic cards, alerts, and badges
- **Backend:**
  - Node.js & Express.js
  - Middleware: `cors()` and `express.json()`
  - Database Driver: `mysql2/promise` (connection pooling & transactional queries)
  - Config: `dotenv`
- **Database:**
  - MySQL / MariaDB (XAMPP)

---

## 🗄️ Database Setup (XAMPP phpMyAdmin)

The project is preconfigured with standard XAMPP defaults:
- **Host:** `localhost` (Port `3306`)
- **User:** `root`
- **Password:** `""` *(empty)*
- **Database:** `library_db`

### Option 1: Import via phpMyAdmin (Recommended)
1. Start **XAMPP Control Panel**.
2. Click **Start** for both **Apache** and **MySQL**.
3. Open your web browser and navigate to:
   [http://localhost/phpmyadmin](http://localhost/phpmyadmin)
4. Click on the **Import** tab at the top.
5. Click **Choose File** and select:
   `backend/schema.sql`
6. Click **Go** (or **Import**) at the bottom.
7. The database `library_db` will be created with the tables `books`, `users`, `transactions`, and pre-populated sample records.

### Option 2: Automatic Initialization
When you start the backend server with MySQL running in XAMPP, the backend's built-in `initDatabase()` routine will automatically create `library_db` and all necessary tables and seed records if they do not exist yet!

---

## 🚀 Running the Application

### 1. Start the Backend API
Open a terminal in the project root:
```bash
cd backend
npm install   # (Dependencies are already installed)
npm start
```
The server will start on: **`http://localhost:5000`**

*(For development with auto-reload, you can also run `npm run dev`)*.

---

### 2. Start the React Frontend
Open a second terminal in the project root:
```bash
cd frontend
npm install   # (Dependencies are already installed)
npm run dev
```
The frontend application will start on: **`http://localhost:3000`**

Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 👥 Pre-seeded Test Accounts & Sample Books

### User Credentials for Testing
| Name | Membership ID | Role | Password | Access Level |
| :--- | :--- | :--- | :--- | :--- |
| **System Administrator** | `ADMIN001` | **Admin** | `admin123` | Full access to add/edit/delete users and books, restock inventory |
| **Alice Smith** | `MEM001` | **Member** | `member123` | Borrow books, view catalogue & transaction history |
| **Bob Johnson** | `MEM002` | **Member** | `member123` | Borrow books, view catalogue & transaction history |

*(You can also click the quick demo buttons on the Login page to prefill credentials instantly).*

---

## 🛡️ Role-Based Access Control (RBAC) Matrix

| Feature / Action | Admin (`ADMIN001`) | Member (`MEM001` / `MEM002`) | Guest / Unauthenticated |
| :--- | :---: | :---: | :---: |
| **View Dashboard & Availability** | ✅ | ✅ | ✅ |
| **View Transaction History Log** | ✅ | ✅ | ✅ |
| **Borrow Books (`BORROW`)** | ✅ (for any member) | ✅ (for self only) | ❌ (Login required) |
| **Restock Inventory (`ADD`)** | ✅ | ❌ | ❌ |
| **View Book Management Nav Link** | ✅ | ❌ | ❌ |
| **Add / Edit / Delete Books** | ✅ | ❌ (Read-only catalogue) | ❌ |
| **View User Management Nav Link** | ✅ | ❌ | ❌ |
| **Admin User Directory & Actions** | ✅ | ❌ (Profile view only) | ❌ (Login form only) |
| **Backend Route Protection** | Headers: `x-user-role: Admin` | Returns HTTP `403` Forbidden | Returns HTTP `403` Forbidden |

### Sample Books Included in Seed Data
1. **Clean Code** by *Robert C. Martin* — 5 copies (In Stock)
2. **The Pragmatic Programmer** by *Andrew Hunt & David Thomas* — 1 copy (**Low Stock Warning < 2 copies**)
3. **Design Patterns** by *Erich Gamma et al.* — 4 copies (In Stock)
4. **JavaScript: The Good Parts** by *Douglas Crockford* — 0 copies (**Out of Stock / Borrow Disabled**)
5. **Introduction to Algorithms** by *Thomas H. Cormen* — 3 copies (In Stock)

---

## 📄 Key Features & Page Views

### 1. Dashboard (`/`)
- **Key Metrics Overview:** Total Book Titles, Total Available Copies, Low Stock Alerts Count, Registered Members.
- **Low-Stock Alert Banner:** Prominently highlights if any books have fewer than 2 copies remaining in stock, with a direct link to restock.
- **Availability Table:** Displays all books, author, genre, ISBN, quantity, and real-time status badges (`Available`, `Low Stock (< 2)`, `Out of Stock`).
- **Recent Transaction Activity:** Quick overview of the latest stock changes and borrowings.

### 2. Book Management (`/books`)
- **Controlled Add Book Form:** Inputs for `Title`, `Author`, `Genre`, `ISBN`, and `Initial Quantity` with field-level validation.
- **Editable Book Catalogue:** Displays all books with working **Update** (opens an edit modal with pre-filled inputs) and **Delete** (with confirmation dialog) actions.

### 3. Transactions (`/transactions`)
- **Borrow Book (`BORROW`):** Select book, select registered member, enter quantity.
  - Automatically validates against current stock.
  - Prevents borrowing if stock is `0` or if requested quantity exceeds available stock.
  - Deducts quantity from `books` table.
- **Restock Inventory (`ADD`):** Select book and quantity to add.
  - Automatically increments quantity in `books` table.
- **Live Transaction History Log:** Displays all transaction records with book title, member name, action type badges (`+ RESTOCK` vs `- BORROW`), quantity change, and timestamp. Includes filter buttons (`All`, `Borrowings`, `Restocks`).

### 4. User Management (`/users`)
- **User Login:** Controlled login form with feedback and active session indicator in the navigation bar.
- **Admin View:**
  - Form to add new members or administrators (`Name`, `Membership ID`, `Role`, `Password`).
  - Table of all users with **Edit** and **Delete** buttons.
  - Ability to update existing member details or role.

---

## 📡 RESTful API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/books` | Retrieve all books (ordered by latest) |
| `GET` | `/books/:id` | Retrieve single book details by ID |
| `POST` | `/books` | Add new book (`title`, `author`, `genre`, `isbn`, `quantity`) |
| `PUT` | `/books/:id` | Update book details (`title`, `author`, `genre`, `isbn`, `quantity`) |
| `DELETE` | `/books/:id` | Delete book by ID |
| `GET` | `/users` | Retrieve all users |
| `GET` | `/users/:id` | Retrieve single user by ID |
| `POST` | `/users` | Create user (`name`, `membership_id`, `role`, `password`) |
| `PUT` | `/users/:id` | Update user (`name`, `membership_id`, `role`, optional `password`) |
| `DELETE` | `/users/:id` | Delete user by ID |
| `POST` | `/users/login` | Authenticate user (`membership_id`, `password`) |
| `GET` | `/transactions` | Retrieve all transactions joined with book and user names |
| `POST` | `/transactions` | Record transaction (`book_id`, `user_id`, `type`: `'ADD'`/`'BORROW'`, `quantity_change`) |
