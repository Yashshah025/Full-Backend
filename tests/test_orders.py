import json
from app import Drink, Order

def test_buy_drink_success(client, db, customer_header):
    # Setup: add a drink to buy
    drink = Drink(name="Matcha Latte", description="Green tea latte", price=4.50)
    db.session.add(drink)
    db.session.commit()

    # Buy drink with quantity 3
    payload = {
        "quantity": 3
    }
    response = client.post(f'/buy/{drink.id}', json=payload, headers=customer_header)
    assert response.status_code == 201
    
    data = response.get_json()
    assert data["message"] == "Order placed"
    assert data["drink"] == "Matcha Latte"
    assert data["quantity"] == 3
    assert data["total"] == 4.50 * 3  # 13.50

    # Verify order exists in DB
    order = Order.query.first()
    assert order is not None
    assert order.quantity == 3
    assert order.total_price == 13.50

def test_buy_drink_validation_error(client, db, customer_header):
    # Setup: add a drink
    drink = Drink(name="Espresso", description="Pure extraction", price=2.00)
    db.session.add(drink)
    db.session.commit()

    # Test invalid quantity (marshmallow order validation requires quantity >= 1)
    payload = {
        "quantity": 0
    }
    response = client.post(f'/buy/{drink.id}', json=payload, headers=customer_header)
    assert response.status_code == 400
    assert "quantity" in response.get_json()["error"]

def test_get_orders_history(client, db, customer_header):
    # Setup: add a drink
    drink = Drink(name="Macchiato", description="Espresso and milk", price=3.50)
    db.session.add(drink)
    db.session.commit()

    # Place order
    client.post(f'/buy/{drink.id}', json={"quantity": 2}, headers=customer_header)

    # Fetch orders history list
    response = client.get('/orders', headers=customer_header)
    assert response.status_code == 200
    
    data = response.get_json()
    assert "orders" in data
    assert len(data["orders"]) == 1
    assert data["orders"][0]["drink"] == "Macchiato"
    assert data["orders"][0]["quantity"] == 2
    assert data["orders"][0]["total"] == 3.50 * 2