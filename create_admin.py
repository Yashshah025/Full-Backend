import sys
from app import app, db, User   
from werkzeug.security import generate_password_hash

def make_admin(username, password):
    with app.app_context():
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            print(f"Error: User '{username}' already exists.")
            return
        admin = User(
            username=username,
            password_hash=generate_password_hash(password),
            role="admin"
        )
        db.session.add(admin)
        db.session.commit()
        print(f"Success: Admin user '{username}' created successfully!")
if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python create_admin.py <username> <password>")
        sys.exit(1)
        
    username_arg = sys.argv[1]
    password_arg = sys.argv[2]
    make_admin(username_arg, password_arg)
