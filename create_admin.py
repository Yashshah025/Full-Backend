import sys
from app import app, db, User
from werkzeug.security import generate_password_hash

if len(sys.argv) < 3:
    print("Usage: python create_admin.py <username> <password>")
    sys.exit(1)

username = sys.argv[1]
password = sys.argv[2]

with app.app_context():
    # Check if user already exists
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        print(f"User {username} already exists. Updating role to admin...")
        existing_user.role = "admin"
        existing_user.password_hash = generate_password_hash(password)
    else:
        new_user = User(
            username=username,
            password_hash=generate_password_hash(password),
            role="admin"
        )
        db.session.add(new_user)
    db.session.commit()
    print(f"Admin user '{username}' successfully created/updated!")
