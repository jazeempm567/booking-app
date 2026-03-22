import fitz
import os

# Paths
pdf_path = r'c:\Users\Lenovo\OneDrive\Documents\booking-app\zahiwebservices.pdf'
output_dir = r'c:\Users\Lenovo\OneDrive\Documents\booking-app\images\services'

# Create output directory if it doesn't exist
os.makedirs(output_dir, exist_ok=True)

# Open PDF
pdf = fitz.open(pdf_path)
image_count = 0

# Extract images from all pages
for page_num in range(len(pdf)):
    page = pdf[page_num]
    image_list = page.get_images()
    
    for img_index, img in enumerate(image_list):
        xref = img[0]
        pix = fitz.Pixmap(pdf, xref)
        
        # Save image
        img_path = os.path.join(output_dir, f'service_{image_count + 1}.png')
        pix.save(img_path)
        image_count += 1
        print(f'Extracted: service_{image_count}.png')

print(f'\nTotal images extracted: {image_count}')
pdf.close()
