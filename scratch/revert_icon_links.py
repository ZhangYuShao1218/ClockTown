import re

with open('src/data/roles.ts', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace("'https://wiki.bloodontheclocktower.com/images/d/d3/Icon_slayer.png'", "'/icons/slayer.png'")
c = c.replace("'https://wiki.bloodontheclocktower.com/images/c/c3/Icon_soldier.png'", "'/icons/soldier.png'")
c = c.replace("'https://wiki.bloodontheclocktower.com/images/a/a1/Icon_mayor.png'", "'/icons/mayor.png'")
c = c.replace("'https://wiki.bloodontheclocktower.com/images/5/5c/Icon_imp.png'", "'/icons/imp.png'")

with open('src/data/roles.ts', 'w', encoding='utf-8') as f:
    f.write(c)

print("Reverted to local image paths")
