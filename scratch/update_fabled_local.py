with open('src/data/roles.ts', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace("'https://wiki.bloodontheclocktower.com/images/d/d4/Icon_sentinel.png'", "'/icons/sentinel.png'")
c = c.replace("'https://wiki.bloodontheclocktower.com/images/c/ca/Icon_angel.png'", "'/icons/angel.png'")

with open('src/data/roles.ts', 'w', encoding='utf-8') as f:
    f.write(c)

print("Updated local paths")
