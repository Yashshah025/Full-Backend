# Flask Drinks Order API

A secure, paginated, and rate-limited RESTful API built with Flask, SQLAlchemy, and PostgreSQL/SQLite, containerized with Docker. This app features a responsive Vite + React frontend client, role-based access control (RBAC), token-based authentication with rotation, automated test suites, and interactive API documentation.

---

## 🚀 Features

*   **Authentication & Authorization**: Secure user registration and login using salted password hashing (`werkzeug`). JWT authentication equipped with **Access & Refresh Tokens** and **Refresh Token Rotation**.
*   **Token Revocation**: Active token blocklist system using database tracking to handle secure user logouts.
*   **Role-Based Access Control (RBAC)**: Specific administrative actions (like modifying the drinks menu) are protected with a custom `@admin_required` decorator. Public registration is locked to the `"customer"` role for safety.
*   **Dockerized Stack**: Run both the Flask API and the React frontend concurrently with a single command (`docker compose up`) featuring hot reloading.
*   **PostgreSQL Support**: Integrated with production-ready PostgreSQL cloud hosting (e.g., Neon.tech) while maintaining a local SQLite fallback.
*   **Interactive API Docs (Swagger)**: Beautiful, interactive documentation served at `/apidocs/` via Flasgger, configured to support testing JWT-protected endpoints directly from the browser.
*   **Automated Testing**: 18 integration tests using `pytest` covering authentication flow, menu pagination, admin constraints, and order placing with database mock isolation.
*   **Database Sync Script**: Easily clone remote PostgreSQL tables to a local SQLite database for offline development.

---

## 🛠️ Tech Stack

### Backend
*   **Framework**: Flask
*   **Database**: PostgreSQL (via Neon.tech) / SQLite (fallback)
*   **ORM**: Flask-SQLAlchemy
*   **Authentication**: Flask-JWT-Extended
*   **Documentation**: Flasgger (Swagger UI)
*   **Testing**: Pytest
*   **Migrations**: Flask-Migrate (Alembic database schema tracking)

### Frontend
*   **Core Library**: React 19
*   **Build Tool**: Vite
*   **Routing**: React Router DOM (v7)
*   **HTTP Client**: Axios (with custom token refresh interceptors)
*   **State/Theme**: CSS variables, React Context API

---

## 🐳 Docker Setup & Installation (Recommended)

The easiest way to run the entire stack (both backend and frontend) is using Docker.

### Prerequisites
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running on your machine.
*   A `.env` file in the root directory configured with your database URL and secret key.

### 1. Build and Run the Containers
In the root directory, run:
```bash
# Build the container images
docker compose build

# Start the services
docker compose up
```

This will launch:
*   **Frontend**: `http://localhost:3000`
*   **Backend API**: `http://localhost:5000`
*   **Swagger Documentation**: `http://localhost:5000/apidocs/`

*Note: Changes made to files in VS Code will hot-reload automatically inside the Docker containers!*

---

## 💻 Manual Setup & Installation (Without Docker)

### Prerequisites
*   Python 3.12+ and Node.js (v18+) installed.

### 1. Set up the Backend
1. Navigate to the root directory and create a virtual environment:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate      # Windows
   source .venv/bin/activate    # Mac/Linux
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Configure your `.env` file:
   ```env
   JWT_SECRET_KEY=your_super_secret_jwt_key_here
   DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
   ```
4. Run database migrations:
   ```bash
   flask db upgrade
   ```
5. Start the server:
   ```bash
   python app.py
   ```

### 2. Set up the Frontend
1. Navigate to the `frontend` subfolder:
   ```bash
   cd frontend
   ```
2. Install Node packages:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The client will open on `http://localhost:3000`.

---

## 🧪 Running the Test Suite

We have a suite of **18 automated integration tests** built using `pytest`. They use an isolated, in-memory SQLite database so that they never affect your production Postgres data.

Run the tests inside your active virtual environment:
```bash
python -m pytest -v
```

---

## 🔧 Database Utilities & Admin Setup

### 1. Create an Admin User
Since public registration restricts all users to the `"customer"` role, run the secure admin command-line tool to bootstrap admin accounts:
```bash
python create_admin.py <username> <password>
```

### 2. Seeding the Menu
To seed 50 premium drinks into your database to test pagination, run:
```bash
python seed_50.py
```

### 3. Sync Database Offline
To copy all users, orders, and drinks from PostgreSQL (Neon) to your local SQLite file for offline coding:
```bash
python sync_to_sqlite.py
```

---

## 🔌 API Reference & Endpoints

You can view and test all endpoints interactively by visiting **`http://localhost:5000/apidocs/`** once your server is running.

### 🔐 Authentication

#### Register a New User
*   **URL**: `/register`
*   **Method**: `POST`
*   **Request Body**:
    ```json
    {
      "username": "john_doe",
      "password": "securepassword123"
    }
    ```

#### User Login
*   **URL**: `/login`
*   **Method**: `POST`
*   **Response**:
    ```json
    {
      "access_token": "eyJhbGciOi...",
      "refresh_token": "eyJhbGciOi..."
    }
    ```

#### Token Refresh
*   **URL**: `/refresh`
*   **Method**: `POST`
*   **Headers**: `Authorization: Bearer <REFRESH_TOKEN>`

#### Logout
*   **URL**: `/logout`
*   **Method**: `POST`
*   **Headers**: `Authorization: Bearer <REFRESH_TOKEN>`

### 🥤 Drinks Menu

#### Get Menu (Paginated)
*   **URL**: `/drinks`
*   **Method**: `GET`
*   **Query Parameters**: `page` (default: 1), `limit` (default: 10)

#### Get Drink Details
*   **URL**: `/drinks/<int:id>`
*   **Method**: `GET`

#### Add Drink (Admin Only)
*   **URL**: `/drinks`
*   **Method**: `POST`
*   **Headers**: `Authorization: Bearer <ACCESS_TOKEN>`

### 🛒 Orders

#### Place an Order
*   **URL**: `/buy/<int:drink_id>`
*   **Method**: `POST`
*   **Headers**: `Authorization: Bearer <ACCESS_TOKEN>`
*   **Request Body**: `{"quantity": 2}`

#### View Order History
*   **URL**: `/orders`
*   **Method**: `GET`
*   **Headers**: `Authorization: Bearer <ACCESS_TOKEN>`
