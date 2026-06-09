from PIL import Image
import numpy as np

img = Image.open("logo.png").convert("RGBA")
data = np.array(img)

r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]

# 1. Remove navy background pixels (dark blue range)
navy_mask = (r < 60) & (g < 70) & (b > 90)
data[navy_mask] = [0, 0, 0, 0]

# 2. Recolor white/near-white text to navy (#0D1B8E) for light backgrounds
white_mask = (r > 200) & (g > 200) & (b > 200) & (~navy_mask)
data[white_mask, 0] = 13   # R
data[white_mask, 1] = 27   # G
data[white_mask, 2] = 142  # B
# Keep alpha as-is

result = Image.fromarray(data)

# Crop to content (remove empty space)
bbox = result.getbbox()
if bbox:
    result = result.crop(bbox)

result.save("logo-dark.png")
print(f"Saved logo-dark.png (cropped to {result.size})")

# Also make a version keeping white text (for dark backgrounds, transparent bg)
img2 = Image.open("logo.png").convert("RGBA")
data2 = np.array(img2)
r2, g2, b2, a2 = data2[:,:,0], data2[:,:,1], data2[:,:,2], data2[:,:,3]
navy_mask2 = (r2 < 60) & (g2 < 70) & (b2 > 90)
data2[navy_mask2] = [0, 0, 0, 0]
result2 = Image.fromarray(data2)
bbox2 = result2.getbbox()
if bbox2:
    result2 = result2.crop(bbox2)
result2.save("logo-white.png")
print(f"Saved logo-white.png (cropped to {result2.size})")
