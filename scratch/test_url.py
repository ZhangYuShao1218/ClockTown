import urllib.request
import re

url = 'https://wiki.bloodontheclocktower.com/Trouble_Brewing'
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5'
}
try:
    req = urllib.request.Request(url, headers=headers)
    html = urllib.request.urlopen(req).read().decode('utf-8')
    pattern = r'src="(/images/(?:thumb/)?[^"]+Icon_([^".]+)\.png[^"]*)"'
    matches = re.findall(pattern, html)
    print("Found matches:")
    for m in matches:
        if 'scarletwoman' in m[1].lower():
            print(m)
except Exception as e:
    print(e)
