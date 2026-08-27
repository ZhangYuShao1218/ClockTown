import re

with open('src/data/roles.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace both escaped and unescaped versions just in case
text = re.sub(r'style=\\?"color:\s*#60A5FA;\s*font-weight:\s*bold;\\?"', 'className="highlight-good"', text)
text = re.sub(r'style=\\?"color:\s*#F87171;\s*font-weight:\s*bold;\\?"', 'className="highlight-evil"', text)
# And just in case they are completely unescaped:
text = text.replace('style="color: #60A5FA; font-weight: bold;"', 'className="highlight-good"')
text = text.replace('style="color: #F87171; font-weight: bold;"', 'className="highlight-evil"')

# Remove any remaining backslashes before className
text = text.replace('\\"highlight-good\\"', '"highlight-good"')
text = text.replace('\\"highlight-evil\\"', '"highlight-evil"')

with open('src/data/roles.ts', 'w', encoding='utf-8') as f:
    f.write(text)
