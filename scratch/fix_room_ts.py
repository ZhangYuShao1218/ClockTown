import re

# Add onUnreadCountChange to ChatProps
with open('src/components/game/Chat.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

if 'onUnreadCountChange?:' not in text:
    text = text.replace(
        '  seatCount?: number;\n}',
        '  seatCount?: number;\n  onUnreadCountChange?: (count: number) => void;\n}'
    )

with open('src/components/game/Chat.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

# Fix Room.tsx unused vars
with open('src/components/game/Room.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("Object.entries(players).map(([uid_str, p]: [string, any]) => ({ uid: uid_str, ...(p || {}) }))", "Object.entries(players).map(([uid, p]: [string, any]) => ({ uid, ...(p || {}) }))")
text = text.replace("Object.entries(players).map(([uid, p]: [string, any]) => ({ uid, ...p }))", "Object.entries(players).map(([uid, p]: [string, any]) => ({ uid, ...(p || {}) }))")
# unused rightTab is removed
text = re.sub(r'const \[rightTab, setRightTab\] = useState<\'observers\' \| \'chat\'>\(\'chat\'\);\n', '', text)

with open('src/components/game/Room.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
