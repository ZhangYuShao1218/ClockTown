with open('src/components/common/Modal.tsx', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('children maxWidth', 'children, maxWidth')
with open('src/components/common/Modal.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
