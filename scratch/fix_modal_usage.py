with open('src/components/common/Modal.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('className="w-full max-w-lg rounded-xl', 'className={`w-full ${maxWidth} rounded-md')
c = c.replace('onClick={(e) => e.stopPropagation()}', 'onClick={(e) => e.stopPropagation()}`')

with open('src/components/common/Modal.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
