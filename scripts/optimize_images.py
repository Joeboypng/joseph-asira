from PIL import Image
import os

# Files to process (gallery images)
files = [
    "adevrt.png",
    "bus.png",
    "bundle-flyer-copy.png",
    "job-card.png",
    "closet.png",
    "fp.png",
    "mr.png",
    "shito.png",
]

src_dir = os.path.join(os.path.dirname(__file__), '..', 'images')
src_dir = os.path.abspath(src_dir)

report = []
max_dim = 1600  # max width/height for resized images

for name in files:
    path = os.path.join(src_dir, name)
    if not os.path.exists(path):
        print(f"MISSING\t{name}")
        continue
    before = os.path.getsize(path)
    try:
        img = Image.open(path)
        img_format = img.format
        # resize if larger than max_dim
        w, h = img.size
        if max(w, h) > max_dim:
            img.thumbnail((max_dim, max_dim), Image.LANCZOS)
        # Save optimized PNG fallback (overwrite original)
        png_path = path
        try:
            if img.mode in ("RGBA", "LA"):
                img.save(png_path, format="PNG", optimize=True)
            else:
                # convert to RGB and save PNG optimized
                rgb = img.convert('RGB')
                rgb.save(png_path, format="PNG", optimize=True)
        except Exception:
            img.save(png_path)
        after_png = os.path.getsize(png_path)
        # Save WebP version
        webp_path = os.path.splitext(png_path)[0] + ".webp"
        try:
            # Preserve transparency if present
            img.save(webp_path, format="WEBP", quality=80, method=6)
        except Exception:
            temp = img.convert('RGB')
            temp.save(webp_path, format="WEBP", quality=80, method=6)
        after_webp = os.path.getsize(webp_path)
        report.append((name, before, after_png, after_webp))
    except Exception as e:
        print(f"ERROR\t{name}\t{e}")

# Print CSV report: name, before(bytes), after_png(bytes), after_webp(bytes)
print("name\tbefore\tafter_png\tafter_webp")
for r in report:
    name, before, after_png, after_webp = r
    print(f"{name}\t{before}\t{after_png}\t{after_webp}")
print("Done")
