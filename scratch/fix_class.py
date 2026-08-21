import re

with open('src/data/roles.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Fix className to class for dangerouslySetInnerHTML
text = text.replace('className="highlight-good"', 'class="highlight-good"')
text = text.replace('className="highlight-evil"', 'class="highlight-evil"')

with open('src/data/roles.ts', 'w', encoding='utf-8') as f:
    f.write(text)
