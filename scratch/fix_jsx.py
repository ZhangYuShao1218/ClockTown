import re

with open('src/components/game/CenterStage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Fix the JSX ternary wrapper issue
text = re.sub(
    r'(<RoleIcon icon=\{role\.icon\}[^\>]*>)\s*(<div className="absolute top-full[^>]*>\s*<div dangerouslySetInnerHTML[^>]*>\s*</div>\s*</div>)',
    r'<>\1\2</>',
    text
)

with open('src/components/game/CenterStage.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
