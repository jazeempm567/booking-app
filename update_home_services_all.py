import json

json_path = r'c:\Users\Lenovo\OneDrive\Documents\booking-app\data\services.json'

with open(json_path, 'r', encoding='utf-8-sig') as f:
    services = json.load(f)

# Only Moroccan Bath (id 10) is studio-only
studio_only = [10]

for service in services:
    if service['id'] in studio_only:
        service['isHomeService'] = False
    else:
        service['isHomeService'] = True

with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(services, f, indent=4, ensure_ascii=False)

print("Updated home service availability:")
for service in services:
    status = "✓ Home Available" if service['isHomeService'] else "✗ Studio Only"
    print(f"{service['id']:2}. {service['name']:<40} {status}")
