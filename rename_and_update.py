import os
import json
import re

# Directory paths
images_dir = r'c:\Users\Lenovo\OneDrive\Documents\booking-app\images\services'
json_path = r'c:\Users\Lenovo\OneDrive\Documents\booking-app\data\services.json'

# Mapping of service index to titles from PDF
titles_mapping = {
    1: "Special Oil Massage",
    2: "Special Full Body Lotion Massage",
    3: "Hot Stone Massage",
    4: "Hot Oil Massage",
    5: "Swedish Massage",
    6: "Aroma Massage",
    7: "Thai Massage",
    8: "Special Body Oil Massage",
    9: "Deep Tissue Massage",
    10: "Moroccan Bath",
    11: "Four Hand Massage",
    12: "Couple Massage",
    13: "Arabic Massage",
    14: "Russian Massage",
    15: "Foot Massage"
}

# Function to convert title to filename (sanitize)
def title_to_filename(title):
    # Convert to lowercase, replace spaces with hyphens, remove special chars
    filename = title.lower()
    filename = re.sub(r'[^a-z0-9\s-]', '', filename)
    filename = re.sub(r'\s+', '-', filename)
    return filename

# Rename images based on titles
print("Renaming images...")
for index, title in titles_mapping.items():
    old_filename = f'service_{index}.png'
    new_filename = f'{title_to_filename(title)}.png'
    
    old_path = os.path.join(images_dir, old_filename)
    new_path = os.path.join(images_dir, new_filename)
    
    if os.path.exists(old_path):
        os.rename(old_path, new_path)
        print(f'{old_filename} -> {new_filename}')
    else:
        print(f'WARNING: {old_filename} not found')

# Update services.json
print("\nUpdating services.json...")
with open(json_path, 'r', encoding='utf-8-sig') as f:
    services = json.load(f)

# Update each service with correct name and image path
for i, service in enumerate(services, 1):
    if i in titles_mapping:
        title = titles_mapping[i]
        filename = f'{title_to_filename(title)}.png'
        
        # Update service name
        service['name'] = title
        
        # Update image path
        service['image'] = f'/images/services/{filename}'
        
        print(f'{i}. {title} -> /images/services/{filename}')

# Write updated services.json
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(services, f, indent=4, ensure_ascii=False)

print(f'\nSuccessfully updated {len(services)} services')
