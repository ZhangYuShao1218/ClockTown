import urllib.request
url = 'https://wiki.bloodontheclocktower.com/images/1/13/Icon_scarletwoman.png'
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5'
}
req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req) as response, open('public/icons/scarletwoman.png', 'wb') as out_file:
    out_file.write(response.read())
print('Downloaded scarletwoman manually.')
