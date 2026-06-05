import requests

response = requests.get(
    "https://jsonplaceholder.typicode.com/users"
)
data = response.json()
for user in data:
    print(user["name"])
    print(user["email"])
    print()