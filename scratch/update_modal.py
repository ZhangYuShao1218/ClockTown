import re
with open('src/components/common/Modal.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('children: React.ReactNode;', 'children: React.ReactNode;\n  maxWidth?: string;')
c = c.replace('}: ModalProps) => {', 'maxWidth = "max-w-lg" }: ModalProps) => {')
c = c.replace('w-full max-w-lg rounded-xl', 'w-full ${maxWidth} rounded-md')

with open('src/components/common/Modal.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
