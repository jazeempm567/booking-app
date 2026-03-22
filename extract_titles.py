import fitz
import os
import re

# Paths
pdf_path = r'c:\Users\Lenovo\OneDrive\Documents\booking-app\zahiwebservices.pdf'
output_dir = r'c:\Users\Lenovo\OneDrive\Documents\booking-app\images\services'

# Open PDF
pdf = fitz.open(pdf_path)

# Dictionary to store page content and images
pages_data = []

# Extract text and images with their positions
for page_num in range(len(pdf)):
    page = pdf[page_num]
    text = page.get_text()
    images = page.get_images()
    
    pages_data.append({
        'page_num': page_num,
        'text': text,
        'images': images
    })
    
    print(f"\n--- Page {page_num + 1} ---")
    print("Text content:")
    print(text)
    print(f"Number of images: {len(images)}")

pdf.close()

# Print all extracted data for review
print("\n\n=== EXTRACTED PAGE DATA ===")
for i, page_data in enumerate(pages_data):
    print(f"\nPage {i + 1}:")
    print(f"Text: {page_data['text'][:200]}...")
    print(f"Images: {len(page_data['images'])}")
