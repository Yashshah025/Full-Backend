import os
from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, create_refresh_token, jwt_required, get_jwt_identity, get_jwt
from flask_migrate import Migrate
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from datetime import timedelta
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from handlers.error_handlers import register_error_handlers
from handlers.jwt_handlers import register_jwt_callbacks
from flasgger import Swagger
from schemas.auth_schema import RegisterSchema, LoginSchema
from schemas.drink_schema import DrinkSchema, DrinkUpdateSchema
from schemas.order_schema import OrderSchema
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)

CORS(app, origins=["http://localhost:3000",
    "http://localhost:5000",
    "http://127.0.0.1:5000",
    "http://localhost:5173",
    "http://127.0.0.1:5173"],
    "https://sip-saviour-frontend.vercel.app", allow_headers=["Content-Type", "Authorization"])
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///drinks.db")
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=15)
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=7)

Swagger_config = {
    "headers": [],
    "specs": [
        {
        "endpoint": 'apispec_1',
        "route": '/apispec_1.json',
        "rule_filter": lambda rule: True, # include all routes
        "model_filter": lambda tag: True,  # include all models
        }
    ],
    "static_url_path": "/flasgger_static",
    "swagger_ui": True,
    "specs_route": "/apidocs/"
}

template = {
    "swagger": "2.0",
    "info": {
        "title": "Drinks API",
        "description": "API documentation for the Drinks Ordering application",
        "version": "1.0.0"
    },
    "securityDefinitions": {
        "Bearer": {
            "type": "apiKey",
            "name": "Authorization",
            "in": "header",
            "description": "JWT Authorization header using the Bearer scheme. Example: 'Bearer {token}'"
        }
    }
}

db = SQLAlchemy(app)
swagger = Swagger(app, config=Swagger_config, template=template)
jwt = JWTManager(app)
migrate = Migrate(app,db)

register_schema = RegisterSchema()
login_schema = LoginSchema()
drink_schema = DrinkSchema()
order_schema = OrderSchema()
drink_update_schema = DrinkUpdateSchema()
register_error_handlers(app)
register_jwt_callbacks(jwt)

limiter = Limiter(key_func=get_remote_address, app=app, default_limits=["200 per day", "50 per hour"])

@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):

    if jwt_payload["type"] == "refresh":
        jti = jwt_payload["jti"]
        token = TokenBlacklist.query.filter_by(jti=jti).first()
        return token is not None

    return False

def admin_required(func):

    @wraps(func)
    def wrapper(*args, **kwargs):

        claims = get_jwt()

        if claims["role"] != "admin":
            return {"error": "Admins only"}, 403
        
        return func(*args, **kwargs)

    return wrapper

@app.route('/')
def index():
    return "Welcome to my App"

class User(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    username = db.Column(db.String(100), nullable = False, unique = True)
    password_hash = db.Column(db.String(250), nullable=False)
    role = db.Column(db.String(20), nullable = False, default = "customer")
    orders = db.relationship('Order', backref='user', lazy=True)

class TokenBlacklist(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    jti = db.Column(db.String(36), nullable = False, unique = True)

class Drink(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String(100), nullable = False)
    description = db.Column(db.String(120), nullable = False)
    price = db.Column(db.Float)
    orders = db.relationship('Order', backref='drink', lazy=True)

    def __repr__(self):
        return f"{self.name} - {self.description} - {self.price}"

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "price": self.price
        }

class Order(db.Model):
    id = db.Column(db.Integer, primary_key = True)

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable = False)
    drink_id = db.Column(db.Integer, db.ForeignKey('drink.id'), nullable = False)

    quantity = db.Column(db.Integer, nullable = False)
    total_price = db.Column(db.Float, nullable = False)


@app.route('/register', methods=['POST'])
@limiter.limit("3 per minute")
def register():
    """
    Register a new user
    ---
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - username
            - password
            - role
          properties:
            username:
              type: string
              example: "john_doe"
            password:
              type: string
              example: "securepassword123"
            role:
              type: string
              enum: [customer, admin]
              default: customer
    responses:
      201:
        description: User successfully registered
      400:
        description: Validation error
      429:
        description: Rate limit exceeded
    """

    data = register_schema.load(request.get_json())

    username = data["username"].strip()
    password = data["password"].strip()
    role = "customer"
    
    hashed_password = generate_password_hash(password)

    user = User(
        username=username,
        password_hash=hashed_password,
        role=role
    )

    db.session.add(user)
    db.session.commit()

    return {
        "message": "User created"
    }, 201

@app.route('/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    """
    Log in a user and retrieve tokens
    ---
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - username
            - password
          properties:
            username:
              type: string
              example: "john_doe"
            password:
              type: string
              example: "securepassword123"
    responses:
      200:
        description: Successful login
        schema:
          type: object
          properties:
            access_token:
              type: string
            refresh_token:
              type: string
      401:
        description: Invalid credentials
      429:
        description: Rate limit exceeded
    """
    data = login_schema.load(request.get_json())

    username = data["username"].strip()
    password = data["password"].strip()
    
    user = User.query.filter_by(username=username).first()

    if user and check_password_hash(user.password_hash, password):

        access_token = create_access_token(identity=user.username, additional_claims={"role": user.role})
        refresh_token = create_refresh_token(identity = user.username)

        return {
            "access_token": access_token,
            "refresh_token": refresh_token
        }, 200
    return {"error": "Invalid Credentials"}, 401


@app.route("/refresh", methods=['POST'])
@jwt_required(refresh = True)
@limiter.limit("20 per minute")
def refresh():
    """
    Refresh access token using a refresh token
    ---
    security:
      - Bearer: []
    responses:
      200:
        description: New access and refresh tokens returned
        schema:
          type: object
          properties:
            access_token:
              type: string
            refresh_token:
              type: string
      401:
        description: Token revoked or invalid
      429:
        description: Rate limit exceeded
    """
    jti = get_jwt()['jti']

    db.session.add(TokenBlacklist(jti=jti))

    current_user = get_jwt_identity()

    user = User.query.filter_by(username = current_user).first()
    access_token = create_access_token(identity = user.username, additional_claims = {"role": user.role})

    refresh_token = create_refresh_token(identity = user.username)

    db.session.commit()

    return {
        "access_token": access_token,
        "refresh_token": refresh_token
    }, 200


@app.route('/logout', methods=['POST'])
@jwt_required(refresh=True)
def logout():
    """
    Log out a user by revoking their refresh token
    ---
    security:
      - Bearer: []
    responses:
      200:
        description: Refresh token successfully revoked
      401:
        description: Missing or invalid token
    """

    jti=get_jwt()['jti']

    revoked_token = TokenBlacklist(jti=jti)

    db.session.add(revoked_token)
    db.session.commit()

    return {
        "message": "Refresh Token Revoked"
    }, 200

@app.route('/profile')
@jwt_required()
def Profile():
    """
    Get current user profile
    ---
    security:
      - Bearer: []
    responses:
      200:
        description: User profile details
      401:
        description: Missing or invalid JWT token
    """
    current_user = get_jwt_identity()
    claims = get_jwt()
    return {
        "user":current_user,
        "role":claims["role"]
    }


@app.route('/drinks', methods=['GET'])
def get_menu():
    """
    Retrieve drinks menu (paginated)
    ---
    parameters:
      - name: page
        in: query
        type: integer
        default: 1
        description: Page number to retrieve
      - name: limit
        in: query
        type: integer
        default: 10
        description: Number of items per page
    responses:
      200:
        description: A paginated list of drinks
      400:
        description: Invalid query parameters
    """
    page = request.args.get("page", 1, type=int)
    limit = request.args.get("limit", 10, type=int)

    if page < 1:
        return {"error": "Page must be greater than 0"}, 400

    if limit < 1:
        return {"error": "Limit must be greater than 0"}, 400

    if limit > 100:
        limit = 100
        
    drinks = Drink.query.paginate(page = page, per_page=limit, error_out=False)    
    output = []

    for drink in drinks.items:
        output.append(drink.to_dict())
        
    return {
        "page": page,
        "per_page": limit,
        "total_items": drinks.total,
        "total_pages": drinks.pages,
        "has_next": drinks.has_next,
        "has_prev": drinks.has_prev,
        "drinks": output
    }, 200


@app.route('/drinks/<int:id>', methods=['GET'])
def get_through_id(id):
    """
    Get a single drink by its ID
    ---
    parameters:
      - name: id
        in: path
        type: integer
        required: true
        description: The ID of the drink
    responses:
      200:
        description: Drink details returned
      404:
        description: Drink not found
    """

    drink = db.get_or_404(Drink, id)
    return drink.to_dict(), 200


@app.route('/drinks', methods=['POST'])
@jwt_required()
@admin_required
def add_drinks():
    """
    Add a new drink (Admin only)
    ---
    security:
      - Bearer: []
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - name
            - description
            - price
          properties:
            name:
              type: string
              example: "Cortado"
            description:
              type: string
              example: "Equal parts espresso and warm milk"
            price:
              type: number
              example: 3.75
    responses:
      201:
        description: Drink created successfully
      400:
        description: Validation error
      401:
        description: Unauthorized (missing or invalid token)
      403:
        description: Forbidden (requires admin role)
    """
    data = drink_schema.load(request.get_json())
    
    drink = Drink(
    name=data["name"],
    description=data["description"],
    price=data["price"]
    )
    
    db.session.add(drink)
    db.session.commit()
    return drink.to_dict(), 201


@app.route('/drinks/<int:id>', methods=['PATCH'])
@jwt_required()
@admin_required
def update(id):
    """
    Update a drink's details partially (Admin only)
    ---
    security:
      - Bearer: []
    parameters:
      - name: id
        in: path
        type: integer
        required: true
        description: The ID of the drink to update
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            name:
              type: string
              example: "Iced Americano"
            description:
              type: string
              example: "Espresso with cold water over ice"
            price:
              type: number
              example: 3.00
    responses:
      200:
        description: Drink updated successfully
      400:
        description: No fields provided for update
      401:
        description: Unauthorized
      403:
        description: Forbidden
      404:
        description: Drink not found
    """
    drink = db.get_or_404(Drink, id)

    data = drink_update_schema.load(request.get_json() or {})

    if not data:
        return {
            "error": "At least one field is required"
        }, 400
    
    if "name" in data:
        drink.name = data["name"]

    if "description" in data:
        drink.description = data["description"]

    if "price" in data:
        drink.price = data["price"]

    db.session.commit()

    return drink.to_dict(), 200


@app.route('/buy/<int:drink_id>', methods=['POST'])
@jwt_required()
def buy_drinks(drink_id):
    """
    Place an order for a drink
    ---
    security:
      - Bearer: []
    parameters:
      - name: drink_id
        in: path
        type: integer
        required: true
        description: The ID of the drink to buy
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            quantity:
              type: integer
              default: 1
              description: Quantity of the drink to order (must be >= 1)
    responses:
      201:
        description: Order placed successfully
      400:
        description: Validation error (e.g. quantity < 1)
      401:
        description: Unauthorized
      404:
        description: Drink not found
    """
    current_user = get_jwt_identity()

    user = User.query.filter_by(username=current_user).first()

    drink = db.get_or_404(Drink, drink_id)

    data = order_schema.load(request.get_json()) or {}
    quantity = data["quantity"]
    
    order = Order(
        user_id=user.id,
        drink_id=drink.id,
        quantity=quantity,
        total_price=drink.price * quantity
    )

    db.session.add(order)
    db.session.commit()

    return {
        "message": "Order placed",
        "drink": drink.name,
        "quantity": quantity,
        "total": order.total_price
    }, 201


@app.route('/orders')
@jwt_required()
def my_orders():
    """
    Retrieve order history of the current user
    ---
    security:
      - Bearer: []
    responses:
      200:
        description: List of user's orders
      401:
        description: Unauthorized
    """

    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()

    output = []
    
    for order in user.orders:
        output.append({
            "order_id": order.id,
            "drink": order.drink.name,
            "quantity": order.quantity,
            "total": order.total_price
        })

    return {"orders": output}, 200


@app.route('/drinks/<int:id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_drink(id):
    """
    Delete a drink (Admin only)
    ---
    security:
      - Bearer: []
    parameters:
      - name: id
        in: path
        type: integer
        required: true
        description: The ID of the drink to delete
    responses:
      204:
        description: Drink successfully deleted
      401:
        description: Unauthorized
      403:
        description: Forbidden
      404:
        description: Drink not found
    """

    drink = db.get_or_404(Drink, id)

    db.session.delete(drink)
    db.session.commit()
    return '', 204


if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(debug=False, host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
