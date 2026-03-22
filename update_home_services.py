import json

# Paths
json_path = r'c:\Users\Lenovo\OneDrive\Documents\booking-app\data\services.json'

# Read services.json
with open(json_path, 'r', encoding='utf-8-sig') as f:
    services = json.load(f)

# Services available for home (most massage services)
home_services = [1, 2, 5, 6, 7, 8, 9, 11, 13, 14, 15]  # IDs that can be home services

# Update isHomeService flag
for service in services:
    if service['id'] in home_services:
        service['isHomeService'] = True
    else:
        service['isHomeService'] = False

# Write back
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(services, f, indent=4, ensure_ascii=False)

print("Updated home service availability:")
for service in services:
    home_status = "✓ Home Available" if service['isHomeService'] else "✗ Studio Only"
    print(f"{service['id']:2}. {service['name']:40} {home_status}")
