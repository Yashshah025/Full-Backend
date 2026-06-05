import json
from app import Drink

def test_get_drinks_empty(client, db):
    response = client.get('/drinks')
    assert response.status_code == 200
    data = response.get_json()
    assert data["drinks"] == []
    assert data["total_items"] == 0

def test_get_drinks_paginated(client, db):
    for i in range(15):
        drink = Drink(name=f"Coffee {i}", description=f"Premium roast {i}", price=2.5 + i)
        db.session.add(drink)
    db.session.commit()

    # Query Page 1
    response = client.get('/drinks')
    assert response.status_code == 200
    data = response.get_json()
    assert len(data["drinks"]) == 10 
    assert data["total_items"] == 15
    assert data["total_pages"] == 2
    assert data["has_next"] is True
    assert data["has_prev"] is False

    # Query Page 2
    response2 = client.get('/drinks?page=2&limit=10')
    assert response2.status_code == 200
    data2 = response2.get_json()
    assert len(data2["drinks"]) == 5
    assert data2["has_next"] is False
    assert data2["has_prev"] is True

def test_get_drink_by_id(client, db):
    drink = Drink(name="Macchiato", description="Espresso stained with milk", price=3.25)
    db.session.add(drink)
    db.session.commit()

    response = client.get(f'/drinks/{drink.id}')
    assert response.status_code == 200
    assert response.get_json()["name"] == "Macchiato"

    # Query non-existent ID
    response_404 = client.get('/drinks/999')
    assert response_404.status_code == 404

def test_add_drink_admin_success(client, db, admin_header):
    payload = {
        "name": "Cortado",
        "description": "Equal parts espresso and warm milk",
        "price": 3.75
    }
    response = client.post('/drinks', json=payload, headers=admin_header)
    assert response.status_code == 201
    assert response.get_json()["name"] == "Cortado"

    # Check DB persistence
    drink = Drink.query.filter_by(name="Cortado").first()
    assert drink is not None
    assert drink.price == 3.75

def test_add_drink_customer_unauthorized(client, db, customer_header):
    payload = {
        "name": "Flat White",
        "description": "Espresso with microfoam",
        "price": 4.25
    }
    response = client.post('/drinks', json=payload, headers=customer_header)
    assert response.status_code == 403
    assert response.get_json()["error"] == "Admins only"

def test_update_drink_admin(client, db, admin_header):
    drink = Drink(name="Americano", description="Hot water and espresso", price=2.50)
    db.session.add(drink)
    db.session.commit()

    payload = {
        "name": "Iced Americano",
        "price": 3.00
    }
    response = client.patch(f'/drinks/{drink.id}', json=payload, headers=admin_header)
    assert response.status_code == 200
    
    db.session.refresh(drink)
    assert drink.name == "Iced Americano"
    assert drink.price == 3.00

def test_delete_drink_admin(client, db, admin_header):
    drink = Drink(name="Espresso", description="Pure extraction", price=2.00)
    db.session.add(drink)
    db.session.commit()

    response = client.delete(f'/drinks/{drink.id}', headers=admin_header)
    assert response.status_code == 204
    
    deleted = db.session.get(Drink, drink.id)
    assert deleted is None