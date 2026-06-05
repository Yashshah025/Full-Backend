# seed_50.py
from app import app, db, Drink

drinks_list = [
    {"name": "Iced Vanilla Latte", "description": "Espresso and milk with vanilla syrup over ice", "price": 4.50},
    {"name": "Caramel Macchiato", "description": "Freshly steamed milk with vanilla syrup, marked with espresso and caramel", "price": 4.75},
    {"name": "Mocha Frappuccino", "description": "Coffee with mocha sauce, milk and ice, blended and topped with whipped cream", "price": 5.25},
    {"name": "Chai Tea Latte", "description": "Black tea infused with cardamom, cinnamon, black pepper, and ginger with milk", "price": 4.25},
    {"name": "Peach Green Tea", "description": "Green tea blended with peach juice and served over ice", "price": 3.75},
    {"name": "Cold Brew Coffee", "description": "Slow-steeped custom blend in cool water for 20 hours", "price": 3.50},
    {"name": "Nitro Cold Brew", "description": "Our slow-steeped cold brew infused with nitrogen for a smooth, velvety finish", "price": 4.50},
    {"name": "Hot Chocolate", "description": "Steamed milk and mocha sauce topped with sweetened whipped cream", "price": 3.50},
    {"name": "White Chocolate Mocha", "description": "Espresso, steamed milk and white chocolate sauce", "price": 4.75},
    {"name": "Dirty Chai Latte", "description": "Chai tea latte with a shot of espresso", "price": 5.00},
    {"name": "Irish Coffee", "description": "Rich hot coffee mixed with non-alcoholic Irish cream syrup and whipped cream", "price": 4.50},
    {"name": "Affogato", "description": "A scoop of vanilla bean gelato drowned with a shot of hot espresso", "price": 5.00},
    {"name": "Turkish Coffee", "description": "Unfiltered coffee made with finely ground coffee beans boiled in a pot", "price": 3.50},
    {"name": "Flat White", "description": "Espresso with microfoam poured over double ristretto shots", "price": 4.00},
    {"name": "Red Eye", "description": "Drip coffee with a shot of espresso added", "price": 3.75},
    {"name": "Black Eye", "description": "Drip coffee with two shots of espresso added", "price": 4.50},
    {"name": "Espresso Con Panna", "description": "Espresso topped with a dollop of whipped cream", "price": 3.00},
    {"name": "London Fog", "description": "Earl Grey tea, vanilla syrup, and steamed milk", "price": 4.00},
    {"name": "Earl Grey Tea", "description": "Black tea scented with bergamot orange oil", "price": 2.75},
    {"name": "English Breakfast Tea", "description": "Traditional robust blend of black teas", "price": 2.75},
    {"name": "Chamomile Herbal Tea", "description": "Caffeine-free infusion of chamomile flowers", "price": 3.00},
    {"name": "Peppermint Tea", "description": "Refreshing herbal infusion of peppermint leaves", "price": 3.00},
    {"name": "Golden Milk Latte", "description": "Turmeric, black pepper, ginger, and honey with steamed oat milk", "price": 4.75},
    {"name": "Matcha Frappe", "description": "Blended matcha green tea, milk, ice, and whipped cream", "price": 5.25},
    {"name": "Iced Matcha Lemonade", "description": "Matcha green tea combined with lemonade and shaken with ice", "price": 4.25},
    {"name": "Strawberry Acai Lemonade", "description": "Sweet strawberry flavors accented by passion fruit and acai notes", "price": 4.50},
    {"name": "Mango Dragonfruit Refresher", "description": "Mango and dragonfruit flavors shaken with ice and real dragonfruit", "price": 4.50},
    {"name": "Pink Drink", "description": "Strawberry Acai Refresher combined with creamy coconut milk", "price": 4.75},
    {"name": "Vietnamese Iced Coffee", "description": "Strong dark roast coffee brewed over sweetened condensed milk and ice", "price": 4.25},
    {"name": "Spanish Latte", "description": "Espresso, steamed whole milk, and condensed milk", "price": 4.50},
    {"name": "Pumpkin Spice Latte", "description": "Espresso, milk, and pumpkin spice sauce, topped with pumpkin spice toppings", "price": 5.00},
    {"name": "Gingerbread Latte", "description": "Espresso, steamed milk, and gingerbread syrup topped with nutmeg", "price": 5.00},
    {"name": "Peppermint Mocha", "description": "Espresso, steamed milk, mocha sauce, and peppermint syrup", "price": 5.00},
    {"name": "Toffee Nut Latte", "description": "Espresso, milk, and toffee nut syrup with whipped cream", "price": 4.75},
    {"name": "Cinnamon Dolce Latte", "description": "Espresso, milk, and sweet cinnamon dolce syrup", "price": 4.75},
    {"name": "Lemon Mint Iced Tea", "description": "Black tea shaken with fresh mint and fresh lemon juice", "price": 3.50},
    {"name": "Berry Hibiscus Iced Tea", "description": "Hibiscus tea blended with real blackberries and ice", "price": 3.75},
    {"name": "Chai Shake", "description": "Spiced chai concentrate blended with vanilla ice cream and milk", "price": 5.50},
    {"name": "Mocha Shake", "description": "Mocha sauce blended with chocolate ice cream and milk", "price": 5.50},
    {"name": "Mango Smoothie", "description": "Blend of fresh mangoes, yogurt, and milk", "price": 4.75},
    {"name": "Strawberry Banana Smoothie", "description": "Blend of fresh strawberries, bananas, yogurt, and milk", "price": 4.75},
    {"name": "Green Detox Smoothie", "description": "Blend of spinach, kale, green apple, banana, and coconut water", "price": 5.00},
    {"name": "Iced Americano Miel", "description": "Espresso, hot water, honey, and cinnamon over ice", "price": 4.00},
    {"name": "Cascara Latte", "description": "Espresso and milk sweetened with syrup made from coffee cherries", "price": 4.50},
    {"name": "Hojicha Latte", "description": "Roasted green tea powder with steamed milk and a touch of sweetener", "price": 4.50},
    {"name": "Yuzu Lemonade", "description": "Sparkling water mixed with yuzu citrus purée and mint", "price": 4.25},
    {"name": "Rose Latte", "description": "Espresso and steamed milk with organic rose water syrup", "price": 4.50},
    {"name": "Lavender Honey Latte", "description": "Espresso, oat milk, lavender syrup, and wildflower honey", "price": 4.75},
    {"name": "Pistachio Latte", "description": "Espresso, steamed milk, and sweet pistachio sauce", "price": 5.00},
    {"name": "Salted Caramel Cold Brew", "description": "Cold brew topped with salted caramel cream cold foam", "price": 4.75}
]

with app.app_context():
    # Convert dictionaries to Drink models and add them
    new_drinks = [Drink(**drink) for drink in drinks_list]
    db.session.bulk_save_objects(new_drinks)
    db.session.commit()
    print(f"Successfully added {len(new_drinks)} new drinks to the database!")