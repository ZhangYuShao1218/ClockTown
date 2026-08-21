import re

with open('src/components/game/Room.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Match the useEffect block
effect_pattern = r'  useEffect\(\(\) => \{\n    if \(\!user \|\| \!id \|\| \!gameState\) return;\n    import\("firebase/database"\)\.then\(\(\{ onDisconnect, ref, update \}\) => \{\n      import\("\.\./\.\./services/firebase"\)\.then\(\(\{ db \}\) => \{\n        const playerOnlineRef = ref\(db, `rooms/\$\{id\}/players/\$\{user\.uid\}/isOnline`\);\n        update\(ref\(db\), \{ \[`rooms/\$\{id\}/players/\$\{user\.uid\}/isOnline`\]: true \}\);\n        onDisconnect\(playerOnlineRef\)\.set\(false\);\n      \}\);\n    \}\);\n  \}, \[id, user, gameState\]\);\n\n'

# Find the effect
match = re.search(effect_pattern, content)
if match:
    effect_code = match.group(0)
    # Remove it from its original place
    content = content.replace(effect_code, '')
    
    # Insert it right after the useState definitions
    # Look for `  const [activeLocalScriptId, setActiveLocalScriptId] = useState<string | null>(null);\n\n`
    insert_point = '  const [activeLocalScriptId, setActiveLocalScriptId] = useState<string | null>(null);\n\n'
    if insert_point in content:
        content = content.replace(insert_point, insert_point + effect_code)
        with open('src/components/game/Room.tsx', 'w', encoding='utf-8') as f:
            f.write(content)
        print("Moved useEffect successfully")
    else:
        print("Could not find insert point")
else:
    print("Could not find useEffect")
