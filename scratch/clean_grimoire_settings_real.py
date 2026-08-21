import re
with open('src/components/game/GrimoireSettings.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# I will find the `{script && (` and remove it until `)}`
# Let's just find the exact text in the file.
content = re.sub(r'\s*\{script && \(\s*<div className="space-y-4 pt-4 border-t border-white/10">\s*<h3 className="text-xs font-bold text-white/70">可用角色庫.*?\n\s*\}\)\}\s*', '\n\n', content, flags=re.DOTALL)

with open('src/components/game/GrimoireSettings.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
