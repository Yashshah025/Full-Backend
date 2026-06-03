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
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)

CORS(app, origins=["http://localhost:3000"], allow_headers=["Content-Type", "Authorization"])

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///drinks.db"
db = SQLAlchemy(app)

app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=15)
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=7)

jwt = JWTManager(app)

migrate = Migrate(app,db)

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

@app.errorhandler(429)
def ratelimit_handler(e):
    return {
        "error": "Rate limit exceeded"
    }, 429

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
    data = request.get_json(silent=True) or {}

    username = data.get("username")
    password = data.get("password")
    role = data.get("role", "customer")

    username = username.strip()
    password = password.strip()

    if not username:
        return {"error": "Username is required"}, 400

    if not password:
        return {"error": "Password is required"}, 400

    if User.query.filter_by(username=username).first():
        return {"error": "Username already exists"}, 400
    
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
    data = request.get_json(silent=True) or {}
    
    username = data.get("username")
    password = data.get("password")
    
    username = username.strip()
    password = password.strip()
    
    user = User.query.filter_by(username=username).first()

    if user and check_password_hash(user.password_hash, password):

        access_token = create_access_token(
                                    identity=user.username,
                                    additional_claims={
                                        "role": user.role
                                                }
                                )
        refresh_token = create_refresh_token(
            identity = user.username
        )

        return {
            "access_token": access_token,
            "refresh_token": refresh_token
        }, 200
    return {"error": "Invalid Credentials"}, 401


@app.route("/refresh", methods=['POST'])
@jwt_required(refresh = True)
@limiter.limit("20 per minute")
def refresh():
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
    current_user = get_jwt_identity()
    claims = get_jwt()
    return {
        "user":current_user,
        "role":claims["role"]
    }


@app.route('/drinks', methods=['GET'])
def get_menu():
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
    drink = Drink.query.get_or_404(id)
    return drink.to_dict(), 200


@app.route('/drinks', methods=['POST'])
@jwt_required()
@admin_required
def add_drinks():
    
    data = request.get_json(silent=True) or {}

    if not data:
        return {"error": "No JSON provided"}, 400
    
    if "name" not in data:
        return {"error": "Name not given"}, 400

    if "price" not in data:
        return {"error": "price is required"}, 400 

    if "description" not in data:
        return {"error": "description is required"}, 400

    try:
        price = float(data["price"])
    except:
        return {"error": "Invalid price"}, 400

    if price <= 0:
        return {"error": "Price must be greater than 0"}, 400
    
    drink = Drink(
                    name = data["name"],
                    description = data["description"],
                    price = price
                    )
    
    db.session.add(drink)
    db.session.commit()
    return drink.to_dict(), 201


@app.route('/drinks/<int:id>', methods=['PATCH'])
@jwt_required()
@admin_required
def update(id):
    
    drink = Drink.query.get_or_404(id)
    data = request.get_json(silent=True) or {}
    
    if not data:
        return {"error": "No JSON provided"}, 400
    
    if "name" in data:
        drink.name = data["name"]

    if "description" in data:
        drink.description = data["description"]

    if "price" in data:
        try:
            price = float(data["price"])
        except:
            return {"error": "Invalid price"}, 400

        if price <= 0:
            return {"error": "Price must be greater than 0"}, 400

        drink.price = price

    db.session.commit()
    return drink.to_dict(), 200


@app.route('/buy/<int:drink_id>', methods=['POST'])
@jwt_required()
def buy_drinks(drink_id):
    current_user = get_jwt_identity()

    user = User.query.filter_by(username=current_user).first()

    drink = Drink.query.get_or_404(drink_id)

    data = request.get_json(silent=True) or {}

    quantity = data.get("quantity", 1)
    
    try:
        quantity = int(quantity)
    except:
        return {"error": "Invalid quantity"}, 400
    
    if quantity <= 0:
        return {"error": "Quantity must be greater than 0"}, 400
    
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
    
    drink = Drink.query.get_or_404(id)

    db.session.delete(drink)
    db.session.commit()
    return '', 204


if __name__ == "__main__":
    # with app.app_context():
    #     db.create_all()

    app.run(debug=True)
