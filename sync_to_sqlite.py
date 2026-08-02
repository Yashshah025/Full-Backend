import os
from sqlalchemy import create_engine
from app import app, db, User, Drink, Order, TokenBlacklist

postgres_url = os.getenv("DATABASE_URL")
if not postgres_url:
    print("Error: DATABASE_URL environment variable is not set.")
    exit(1)

if postgres_url.startswith("postgres://"):
    postgres_url = postgres_url.replace("postgres://", "postgresql://", 1)

print("Syncing data from remote Postgres to local SQLite database...")

# Setup engines
remote_engine = create_engine(postgres_url)
local_engine = db.engine

with app.app_context():
    # Make sure local sqlite tables exist
    db.metadata.create_all(bind=local_engine)
    
    from sqlalchemy.orm import sessionmaker
    RemoteSession = sessionmaker(bind=remote_engine)
    remote_session = RemoteSession()
    
    try:
        # Fetch remote records
        remote_users = remote_session.query(User).all()
        remote_drinks = remote_session.query(Drink).all()
        remote_orders = remote_session.query(Order).all()
        remote_tokens = remote_session.query(TokenBlacklist).all()
        
        # Clear local records to prevent primary key collisions
        print("Clearing local SQLite database tables...")
        db.session.query(Order).delete()
        db.session.query(User).delete()
        db.session.query(Drink).delete()
        db.session.query(TokenBlacklist).delete()
        db.session.commit()
        
        # Write to local
        print(f"Syncing {len(remote_users)} users...")
        for u in remote_users:
            local_u = User(id=u.id, username=u.username, password_hash=u.password_hash, role=u.role)
            db.session.add(local_u)
            
        print(f"Syncing {len(remote_drinks)} drinks...")
        for d in remote_drinks:
            local_d = Drink(id=d.id, name=d.name, description=d.description, price=d.price)
            db.session.add(local_d)
            
        print(f"Syncing {len(remote_orders)} orders...")
        for o in remote_orders:
            local_o = Order(id=o.id, user_id=o.user_id, drink_id=o.drink_id, quantity=o.quantity, total_price=o.total_price)
            db.session.add(local_o)

        print(f"Syncing {len(remote_tokens)} blacklisted tokens...")
        for t in remote_tokens:
            local_t = TokenBlacklist(id=t.id, jti=t.jti)
            db.session.add(local_t)
            
        db.session.commit()
        print("Database sync completed successfully!")
        
    except Exception as e:
        db.session.rollback()
        print(f"Failed to sync database: {e}")
    finally:
        remote_session.close()
