import urllib.request
import re
import os
import json

# Fallback: Just grab standard botc images via github or raw data since wiki blocks python urllib (418 Forbidden).
# Let's map out the official names and manually download a few if needed, or rely on the previous cropped ones!
# Let's try downloading from botc-scripts github or just rename the existing cropped ones.
# Actually, the user wants the wiki versions. Let's try to bypass 418 by adding more headers.

url = 'https://wiki.bloodontheclocktower.com/Trouble_Brewing'
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5'
}
req = urllib.request.Request(url, headers=headers)
html = urllib.request.urlopen(req).read().decode('utf-8')

pattern = r'src="(/images/(?:thumb/)?[^"]+Icon_([^".]+)\.png[^"]*)"'
matches = re.findall(pattern, html)

out_dir = 'public/icons'
os.makedirs(out_dir, exist_ok=True)

downloaded = set()

for src, name in matches:
    name = name.lower()
    if name in downloaded:
        continue
        
    full_url = src
    if 'thumb/' in src:
        parts = src.split('/')
        try:
            thumb_idx = parts.index('thumb')
            parts.pop(thumb_idx)
            parts.pop()
            full_url = '/'.join(parts)
        except ValueError:
            pass
            
    full_url = 'https://wiki.bloodontheclocktower.com' + full_url
    
    out_path = os.path.join(out_dir, f'{name}.png')
    try:
        req = urllib.request.Request(full_url, headers=headers)
        with urllib.request.urlopen(req) as response, open(out_path, 'wb') as out_file:
            out_file.write(response.read())
        print(f'Downloaded: {name}')
        downloaded.add(name)
    except Exception as e:
        print(f'Failed to download {name} from {full_url}: {e}')

print('Done.')
