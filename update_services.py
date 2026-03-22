import json

# Read services.json
json_path = r'c:\Users\Lenovo\OneDrive\Documents\booking-app\data\services.json'

with open(json_path, 'r', encoding='utf-8-sig') as f:
    services = json.load(f)

print(f'Loaded {len(services)} services')

# Update image paths for each service
for i, service in enumerate(services, 1):
    old_image = service.get('image', '')
    service['image'] = f'/images/services/service_{i}.png'
    print(f'{i}. {service["name"]} -> {service["image"]}')

# Write back to file
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(services, f, indent=4, ensure_ascii=False)

print(f'\nSuccessfully updated all {len(services)} services with local image paths')
