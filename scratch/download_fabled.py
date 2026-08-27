import urllib.request
url = 'https://wiki.bloodontheclocktower.com/images/1/1d/Icon_sentinel.png'
headers = {'User-Agent': 'Mozilla/5.0'}
try:
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as response, open('public/icons/sentinel.png', 'wb') as out_file:
        out_file.write(response.read())
except: pass

url2 = 'https://wiki.bloodontheclocktower.com/images/3/30/Icon_doomsayer.png'
try:
    req = urllib.request.Request(url2, headers=headers)
    with urllib.request.urlopen(req) as response, open('public/icons/doomsayer.png', 'wb') as out_file:
        out_file.write(response.read())
except: pass
print('Downloaded fabled icons.')
