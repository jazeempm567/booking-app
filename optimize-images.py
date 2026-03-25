import os
from PIL import Image
import json

# Paths
images_dir = r'c:\Users\Lenovo\OneDrive\Documents\booking-app\images\services'
output_dir = images_dir  # Overwrite originals

# Image optimization settings
QUALITY = 85  # 85 = great quality, small size (80-90 is best)
MAX_WIDTH = 800  # Web-optimized size
MAX_HEIGHT = 800

def optimize_image(image_path):
    """Optimize a single image"""
    try:
        img = Image.open(image_path)
        original_size = os.path.getsize(image_path) / 1024  # KB
        
        # Convert RGBA to RGB if needed (removes alpha channel)
        if img.mode in ('RGBA', 'LA', 'P'):
            # Create white background
            bg = Image.new('RGB', img.size, (255, 255, 255))
            bg.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = bg
        
        # Resize if too large
        img.thumbnail((MAX_WIDTH, MAX_HEIGHT), Image.Resampling.LANCZOS)
        
        # Save with optimization
        img.save(image_path, 'PNG', optimize=True, quality=QUALITY)
        
        new_size = os.path.getsize(image_path) / 1024  # KB
        reduction = ((original_size - new_size) / original_size) * 100
        
        return {
            'file': os.path.basename(image_path),
            'original': round(original_size, 2),
            'optimized': round(new_size, 2),
            'reduction': round(reduction, 1)
        }
    except Exception as e:
        return {'file': os.path.basename(image_path), 'error': str(e)}

# Process all images
print("🖼️  Image Optimization in Progress...")
print("=" * 70)
print()

results = []
for filename in sorted(os.listdir(images_dir)):
    if filename.endswith('.png'):
        filepath = os.path.join(images_dir, filename)
        result = optimize_image(filepath)
        results.append(result)
        
        if 'error' not in result:
            print(f"✓ {result['file']:<45} {result['original']:>8}KB → {result['optimized']:>8}KB ({result['reduction']:>5}%)")
        else:
            print(f"✗ {result['file']:<45} ERROR: {result['error']}")

print()
print("=" * 70)

# Summary
successful = [r for r in results if 'error' not in r]
if successful:
    total_original = sum(r['original'] for r in successful)
    total_optimized = sum(r['optimized'] for r in successful)
    total_reduction = ((total_original - total_optimized) / total_original) * 100
    
    print()
    print(f"📊 SUMMARY")
    print(f"Total Original:  {total_original:.2f} MB")
    print(f"Total Optimized: {total_optimized:.2f} MB")
    print(f"Total Reduction: {total_reduction:.1f}%")
    print(f"Images Processed: {len(successful)}")
    print()
    print("✅ Optimization complete! Images ready for production.")
else:
    print("❌ No images were optimized.")
