from app import app, db, Drink

drinks_data = [
    {"name": "Espresso", "description": "Rich, concentrated shot of espresso.", "price": 2.50},
    {"name": "Macchiato", "description": "Espresso stained with a dollop of foamed milk.", "price": 3.00},
    {"name": "Cortado", "description": "Equal parts espresso and warm silky milk.", "price": 3.25},
    {"name": "Cappuccino", "description": "Espresso with equal parts steamed milk and foam.", "price": 3.75},
    {"name": "Latte", "description": "Espresso with steamed milk and a light layer of foam.", "price": 4.00},
    {"name": "Flat White", "description": "Double shot of espresso with velvety microfoam.", "price": 4.00},
    {"name": "Americano", "description": "Espresso shots topped with hot water.", "price": 3.00},
    {"name": "Mocha", "description": "Espresso with steamed milk and rich chocolate syrup.", "price": 4.50},
    {"name": "Affogato", "description": "A scoop of vanilla gelato drowned in hot espresso.", "price": 5.00},
    {"name": "Cold Brew", "description": "Slow-steeped iced coffee, smooth and low-acid.", "price": 3.50},
    {"name": "Nitro Cold Brew", "description": "Cold brew infused with nitrogen for a creamy head.", "price": 4.50},
    {"name": "Iced Latte", "description": "Espresso and cold milk poured over ice.", "price": 4.00},
    {"name": "Iced Mocha", "description": "Chilled latte with chocolate syrup over ice.", "price": 4.75},
    {"name": "Iced Americano", "description": "Espresso shots and cold water over ice.", "price": 3.25},
    {"name": "Caramel Macchiato", "description": "Steamed milk with vanilla, marked with espresso and caramel.", "price": 4.75},
    {"name": "Vanilla Latte", "description": "Espresso, steamed milk, and sweet vanilla syrup.", "price": 4.50},
    {"name": "Hazelnut Latte", "description": "Espresso, steamed milk, and nutty hazelnut syrup.", "price": 4.50},
    {"name": "Matcha Latte", "description": "Finely ground green tea leaves whisked with milk.", "price": 4.75},
    {"name": "Chai Latte", "description": "Spiced black tea blend with steamed milk.", "price": 4.50},
    {"name": "Dirty Chai Latte", "description": "Chai latte boosted with a shot of espresso.", "price": 5.00},
    {"name": "Hot Chocolate", "description": "Rich steamed cocoa with whipped cream.", "price": 3.50},
    {"name": "White Hot Chocolate", "description": "Sweet, creamy white chocolate cocoa.", "price": 3.75},
    {"name": "Irish Coffee", "description": "Hot coffee, Irish whiskey, sugar, topped with cream.", "price": 7.00},
    {"name": "Turkish Coffee", "description": "Unfiltered coffee brewed finely in a cezve.", "price": 4.00},
    {"name": "French Press Coffee", "description": "Full-bodied coffee pressed to perfection.", "price": 3.50},
    {"name": "Pour Over Coffee", "description": "Clean, complex single-origin hand-drip coffee.", "price": 4.00},
    {"name": "Aeropress Coffee", "description": "Rich, smooth coffee brewed using air pressure.", "price": 3.75},
    {"name": "Siphon Coffee", "description": "Vacuum-brewed coffee, clean and scientific.", "price": 5.50},
    {"name": "Iced Tea", "description": "Freshly brewed unsweetened black tea over ice.", "price": 2.75},
    {"name": "Sweet Tea", "description": "Traditional Southern-style sweet iced tea.", "price": 3.00},
    {"name": "Green Tea", "description": "Delicate and antioxidant-rich steamed green tea.", "price": 3.00},
    {"name": "Black Tea", "description": "Robust, fully oxidized premium black tea leaves.", "price": 3.00},
    {"name": "Earl Grey Tea", "description": "Black tea scented with oil of bergamot.", "price": 3.25},
    {"name": "Chamomile Tea", "description": "Herbal infusion of dried chamomile flowers.", "price": 3.00},
    {"name": "Peppermint Tea", "description": "Refreshing and aromatic herbal peppermint leaves.", "price": 3.00},
    {"name": "Rooibos Tea", "description": "Naturally caffeine-free South African red bush tea.", "price": 3.25},
    {"name": "Oolong Tea", "description": "Partially oxidized tea with complex floral notes.", "price": 3.50},
    {"name": "Jasmine Tea", "description": "Green tea scented with fragrant jasmine blossoms.", "price": 3.25},
    {"name": "Hibiscus Tea", "description": "Tart, cranberry-like herbal tea served hot or iced.", "price": 3.25},
    {"name": "Boba Milk Tea", "description": "Sweet black tea, milk, and chewy tapioca pearls.", "price": 5.00},
    {"name": "Taro Milk Tea", "description": "Sweet, creamy purple taro milk tea with boba.", "price": 5.25},
    {"name": "Thai Tea", "description": "Sweet, creamy orange-colored spiced iced tea.", "price": 4.75},
    {"name": "Mango Smoothie", "description": "Blended real mangoes and ice.", "price": 4.50},
    {"name": "Strawberry Banana Smoothie", "description": "Blended fresh strawberries, banana, and yogurt.", "price": 4.75},
    {"name": "Green Smoothie", "description": "Spinach, kale, apple, and banana blend.", "price": 5.00},
    {"name": "Lemonade", "description": "Freshly squeezed lemons, water, and sugar.", "price": 3.00},
    {"name": "Strawberry Lemonade", "description": "Fresh lemonade infused with sweet strawberries.", "price": 3.50},
    {"name": "Italian Soda", "description": "Sparkling water with flavored syrup and cream.", "price": 3.75},
    {"name": "Hot Apple Cider", "description": "Spiced warm apple cider perfect for autumn.", "price": 3.50},
    {"name": "London Fog", "description": "Earl Grey tea latte with vanilla syrup.", "price": 4.25}
]

with app.app_context():
    existing_count = Drink.query.count()
    if existing_count > 0:
        print(f"Database already has {existing_count} drinks. Overwriting with 50 premium drinks...")
        # Clear existing first to make sure they get all 50
        Drink.query.delete()
        db.session.commit()
    
    for drink_info in drinks_data:
        drink = Drink(
            name=drink_info["name"],
            description=drink_info["description"],
            price=drink_info["price"]
        )
        db.session.add(drink)
    db.session.commit()
    print("Successfully seeded 50 premium drinks into the database!")
