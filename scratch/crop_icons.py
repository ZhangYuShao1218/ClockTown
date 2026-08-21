import cv2
import numpy as np
import os

img_path = r'C:\Users\aaron\.gemini\antigravity\brain\eeb09df1-ebc9-46d1-a38b-efb8d5f6e583\.user_uploaded\media_1787129412384.png'
out_dir = r'public\icons'
os.makedirs(out_dir, exist_ok=True)

img = cv2.imread(img_path)
H, W, _ = img.shape

# Estimated centers (x, y) and size
boxes = {
    'washerwoman': (0.10, 0.103), 'monk': (0.505, 0.103),
    'librarian': (0.10, 0.165), 'ravenkeeper': (0.505, 0.165),
    'investigator': (0.10, 0.23), 'virgin': (0.505, 0.23),
    'chef': (0.10, 0.29), 'slayer': (0.505, 0.29),
    'empath': (0.10, 0.355), 'soldier': (0.505, 0.355),
    'fortune_teller': (0.10, 0.42), 'mayor': (0.505, 0.42),
    'undertaker': (0.10, 0.485),
    'butler': (0.10, 0.575), 'recluse': (0.505, 0.575),
    'drunk': (0.10, 0.635), 'saint': (0.505, 0.635),
    'poisoner': (0.10, 0.725), 'scarlet_woman': (0.505, 0.725),
    'spy': (0.10, 0.785), 'baron': (0.505, 0.785),
    'imp': (0.10, 0.88),
}

size = int(W * 0.08) # 8% of width

for name, (nx, ny) in boxes.items():
    cx = int(nx * W)
    cy = int(ny * H)
    x1 = max(0, cx - size // 2)
    y1 = max(0, cy - size // 2)
    x2 = min(W, x1 + size)
    y2 = min(H, y1 + size)
    crop = img[y1:y2, x1:x2]
    cv2.imwrite(os.path.join(out_dir, f'{name}.png'), crop)

print('Icons cropped!')
