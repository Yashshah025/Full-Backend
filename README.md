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

*   **Framework**: Flask
*   **Database**: SQLite (via Flask-SQLAlchemy)
*   **Authentication**: Flask-JWT-Extended
*   **Security & Safety**: Flask-Limiter, Flask-Cors, Werkzeug Security
*   **Database Migrations**: Flask-Migrate (Alembic)

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
