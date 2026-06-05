import json
from app import User, TokenBlacklist

def test_register_success(client, db):
    payload = {
        "username": "yash_test",
        "password": "securepassword123",
        "role": "customer"
    }
    response = client.post('/register', json=payload)

    assert response.status_code == 201
    assert response.get_json()["message"] == "User created"

    user = User.query.filter_by(username="yash_test").first()

    assert user is not None
    assert user.role =="customer"

def test_register_errors(client, db):
    payload = {
        "username": "ya",
        "password": "securepassword123",
        "role": "customer"
    }

    response = client.post('/register', json=payload)
    assert response.status_code == 400
    assert "username" in response.get_json()["error"]

    payload = {
        "username": "yash_test",
        "password": "short",  # Length < 8
        "role": "customer"
    }
    response = client.post('/register', json=payload)
    assert response.status_code == 400
    assert "password" in response.get_json()["error"]


def test_login_success(client, db):
    client.post('/register', json={
        "username": "login_tester",
        "password": "password123",
        "role": "customer"
    })
    
    payload = {
        "username": "login_tester",
        "password": "password123"
    }
    response = client.post('/login', json=payload)
    assert response.status_code == 200

    
    data = response.get_json()
    assert "access_token" in data
    assert "refresh_token" in data

def test_login_invalid_credentials(client, db):
    payload = {
        "username": "unknown_user",
        "password": "wrongpassword"
    }
    response = client.post('/login', json=payload)
    assert response.status_code == 401
    assert "error" in response.get_json()


def test_token_refresh(client, db):
    client.post('/register', json={
        "username": "refresh_tester",
        "password": "password123",
        "role": "customer"
    })
    login_res = client.post('/login', json={
        "username": "refresh_tester",
        "password": "password123"
    }).get_json()
    refresh_token = login_res["refresh_token"]


    headers = {"Authorization": f"Bearer {refresh_token}"}
    response = client.post('/refresh', headers=headers)
    assert response.status_code == 200
    
    data = response.get_json()
    assert "access_token" in data
    assert "refresh_token" in data



def test_logout_and_revocation(client, db):
    client.post('/register', json={
        "username": "logout_tester",
        "password": "password123",
        "role": "customer"
    })

    login_res = client.post('/login', json={
        "username": "logout_tester",
        "password": "password123"
    }).get_json()

    refresh_token = login_res["refresh_token"]
    
    headers = {"Authorization": f"Bearer {refresh_token}"}
    logout_res = client.post('/logout', headers=headers)

    assert logout_res.status_code == 200
    assert logout_res.get_json()["message"] == "Refresh Token Revoked"
    

    refresh_res = client.post('/refresh', headers=headers)
    assert refresh_res.status_code == 401
    assert refresh_res.get_json()["error"] == "Token revoked"


def test_profile_retrieval(client, customer_header):
    # Verify that we can access the profile using our pre-registered customer fixture
    response = client.get('/profile', headers=customer_header)
    assert response.status_code == 200
    
    data = response.get_json()
    assert data["user"] == "customer_tester"
    assert data["role"] == "customer"

def test_register_duplicate_username(client, db):
    payload = {
        "username": "duplicate_user",
        "password": "securepassword123",
        "role": "customer"
    }
    # Register the user the first time (should succeed)
    response1 = client.post('/register', json=payload)
    assert response1.status_code == 201

    # Try to register the exact same username again (should fail with 400)
    response2 = client.post('/register', json=payload)
    assert response2.status_code == 400
    assert response2.get_json()["error"] == "Username already exists"