import pytest
from app import app as flask_app,db as flask_db
from app import User, Drink, Order

@pytest.fixture
def app():

    from app import limiter
    limiter.enabled = False

    # Setup testing configurations
    flask_app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "RATELIMIT_ENABLED": False,  
        "JWT_SECRET_KEY": "test-secret-key"
    })
    
    # Establish application context scope
    with flask_app.app_context():
        # Create an in-memory engine and override the default engine in the cache
        import sqlalchemy as sa
        test_engine = sa.create_engine("sqlite:///:memory:")
        if 'sqlalchemy' in flask_app.extensions:
            flask_app.extensions['sqlalchemy'].engines[None] = test_engine
        yield flask_app



@pytest.fixture
def db(app):
    with app.app_context():
        flask_db.create_all()
        yield flask_db
        flask_db.session.remove()
        flask_db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def admin_header(app, db):
    from flask_jwt_extended import create_access_token
    from werkzeug.security import generate_password_hash

    admin = User(
        username="admin_tester",
        password_hash = generate_password_hash("adminpass123"),
        role = "admin"
    )

    db.session.add(admin)
    db.session.commit()

    token = create_access_token(identity = admin.username, 
                                additional_claims={"role": "admin"})
    
    return{
        "Authorization": f"Bearer {token}"
    }

@pytest.fixture
def customer_header(app, db):
    from flask_jwt_extended import create_access_token
    from werkzeug.security import generate_password_hash

    customer = User(
        username="customer_tester",
        password_hash = generate_password_hash("customerpass123"),
        role = "customer"
    )

    db.session.add(customer)
    db.session.commit()

    token = create_access_token(identity = customer.username, 
                                additional_claims={"role": "customer"})
    
    return{
        "Authorization": f"Bearer {token}"
    }