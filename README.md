# Flask Drinks Order API

A secure, paginated, and rate-limited RESTful API built with Flask, SQLAlchemy, and SQLite. This API supports role-based access control (RBAC), access/refresh token authentication with token rotation, and CORS configuration.

## 🚀 Features

*   **Authentication & Authorization**: Secure user registration and login using salted password hashing (`werkzeug`). JWT authentication equipped with **Access & Refresh Tokens** and **Refresh Token Rotation**.
*   **Token Revocation**: Active token blocklist system using database tracking to handle secure user logouts.
*   **Role-Based Access Control (RBAC)**: Specific administrative actions (like modifying the drinks menu) are protected with a custom `@admin_required` decorator.
*   **Paginated Endpoints**: The drinks list endpoint supports database-level offset pagination using `page` and `limit` query parameters.
*   **Rate Limiting**: Built-in protection against brute-force and spam requests using `Flask-Limiter` (e.g., login limits, registration throttles).
*   **CORS Enabled**: Configured to safely permit cross-origin requests from specific frontend servers (defaults to `http://localhost:3000`).
*   **Database Migrations**: Version-controlled database schema management using `Flask-Migrate` and Alembic.

---

## 🛠️ Tech Stack

### Backend
*   **Framework**: Flask
*   **Database**: SQLite (via Flask-SQLAlchemy ORM)
*   **Authentication**: Flask-JWT-Extended (Access & Refresh tokens)
*   **Security**: Flask-Limiter (Rate limiting), Flask-Cors (CORS headers), Werkzeug Security (password hashing)
*   **Migrations**: Flask-Migrate (Alembic database schema tracking)

### Frontend
*   **Core Library**: React 19
*   **Build Tool**: Vite
*   **Routing**: React Router DOM (v7)
*   **HTTP Client**: Axios (with custom token refresh interceptors)
*   **State Management**: React Context API (Auth state)
*   **Icons**: Lucide React


---

## 💻 Setup & Installation

### Prerequisites
*   Python 3.8+ installed on your system.

### 1. Clone the repository
```bash
git clone <your-repository-url>
cd api
```

### 2. Set up virtual environment
```bash
# Create a virtual environment
python -m venv .venv

# Activate it (Windows)
.venv\Scripts\activate

# Activate it (Mac/Linux)
source .venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Create a `.env` file in the root directory:
```env
JWT_SECRET_KEY=your_fallback_super_secret_jwt_key_here
```

### 5. Run Database Migrations
Initialize the SQLite database schema:
```bash
flask db upgrade
```

### 6. Start the API Server
```bash
python app.py
```
The server will start running on `http://127.0.0.1:5000/` with debug mode enabled.

---

## 🔌 API Reference & Endpoints

### 🔐 Authentication

#### Register a New User
*   **URL**: `/register`
*   **Method**: `POST`
*   **Rate Limit**: `3 per minute`
*   **Request Body**:
    ```json
    {
      "username": "john_doe",
      "password": "securepassword123",
      "role": "customer" 
    }
    ```

#### User Login
*   **URL**: `/login`
*   **Method**: `POST`
*   **Rate Limit**: `5 per minute`
*   **Request Body**:
    ```json
    {
      "username": "john_doe",
      "password": "securepassword123"
    }
    ```
*   **Response**:
    ```json
    {
      "access_token": "eyJhbGciOi...",
      "refresh_token": "eyJhbGciOi..."
    }
    ```

#### Token Refresh (Access Token Renewal)
*   **URL**: `/refresh`
*   **Method**: `POST`
*   **Rate Limit**: `20 per minute`
*   **Headers**: `Authorization: Bearer <REFRESH_TOKEN>`
*   **Response**:
    ```json
    {
      "access_token": "new_access_token_here",
      "refresh_token": "new_refresh_token_here"
    }
    ```

#### Logout (Revoke Refresh Token)
*   **URL**: `/logout`
*   **Method**: `POST`
*   **Headers**: `Authorization: Bearer <REFRESH_TOKEN>`

---

### 🥤 Drinks Menu

#### Get Menu (Paginated)
*   **URL**: `/drinks`
*   **Method**: `GET`
*   **Query Parameters**:
    *   `page` (default: 1): Page number.
    *   `limit` (default: 10, max: 100): Items per page.
*   **Example Request**: `/drinks?page=1&limit=5`

#### Get Drink Details
*   **URL**: `/drinks/<int:id>`
*   **Method**: `GET`

#### Add Drink (Admin Only)
*   **URL**: `/drinks`
*   **Method**: `POST`
*   **Headers**: `Authorization: Bearer <ACCESS_TOKEN>`
*   **Request Body**:
    ```json
    {
      "name": "Iced Latte",
      "description": "Chilled espresso with fresh milk",
      "price": 3.99
    }
    ```

#### Update Drink (Admin Only)
*   **URL**: `/drinks/<int:id>`
*   **Method**: `PATCH`
*   **Headers**: `Authorization: Bearer <ACCESS_TOKEN>`

#### Delete Drink (Admin Only)
*   **URL**: `/drinks/<int:id>`
*   **Method**: `DELETE`
*   **Headers**: `Authorization: Bearer <ACCESS_TOKEN>`

---

### 🛒 Orders

#### Place an Order
*   **URL**: `/buy/<int:drink_id>`
*   **Method**: `POST`
*   **Headers**: `Authorization: Bearer <ACCESS_TOKEN>`
*   **Request Body** *(Optional)*:
    ```json
    {
      "quantity": 2
    }
    ```

#### View My Order History
*   **URL**: `/orders`
*   **Method**: `GET`
*   **Headers**: `Authorization: Bearer <ACCESS_TOKEN>`

---

## 🖥️ Frontend Client

A premium, responsive React client built with **React 19**, **Vite**, and **React Router DOM**. It provides a fully interactive, glassmorphic UI to view, purchase, and configure items on the drinks menu.

### 🌟 Key Features
*   **Persistent Auth State**: User identity is stored statefully. Refresh tokens reside in `localStorage`, and access tokens are held in-memory (React Context API).
*   **Automatic Interceptor Refreshes**: Customized Axios interceptor automatically coordinates refresh token rotation on `401 Unauthorized` responses and replays requests seamlessly.
*   **Role-Based Dynamic Routing**: Protected route checks that block standard customers from accessing the Admin control dashboard.
*   **Clean UI Cards & Skeletons**: Handcrafted CSS styles, animated skeleton cards on load, and custom interactive alerts.

### 💻 Installation & Setup

1. Navigate to the `frontend` subfolder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   The client application will start running on **`http://localhost:3000`**.

### 📂 Directory Layout
*   `src/api/`: Axios client instance and API endpoints mapping.
*   `src/context/`: Authentication context providers managing login state.
*   `src/components/`: Reusable components (Navbar, loaders, custom alerts, protected route decorators).
*   `src/pages/`: Main application pages (paginated Menu catalogs, beverage orders, profiles, and Admin CRUD modals).

