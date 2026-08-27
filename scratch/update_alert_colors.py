import re

with open('src/components/common/AlertDialog.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('border-yellow-900/50', 'border-red-900/50')
text = text.replace('via-yellow-700/50', 'via-red-700/50')
text = text.replace('bg-yellow-900/20', 'bg-red-900/20')
text = text.replace('text-yellow-500', 'text-red-500')
text = text.replace('hover:text-yellow-400', 'hover:text-red-400')
text = text.replace('hover:shadow-yellow-900/20', 'hover:shadow-red-900/20')

with open('src/components/common/AlertDialog.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
