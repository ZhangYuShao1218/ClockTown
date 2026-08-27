import re

with open('src/components/game/CenterStage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# We need to target the tooltipClass in Bluffs and Fabled and change it to `top-[110%] right-0`.
# To be safe, let's just find the first two occurrences of `${tooltipClass}` and replace them with `top-[110%] right-0`.
# Wait, let's use explicit regex that looks at the surrounding context.

# For Bluffs:
text = re.sub(
    r'(\{canSeeBluffs\s*&&\s*role\s*&&\s*\(\s*)<div\s+className=\{`absolute\s+\$\{tooltipClass\}\s+w-64([^>]+)`\}>',
    r'\1<div className="absolute top-[110%] right-0 w-64\2">',
    text
)

# For Fabled:
text = re.sub(
    r'(<RoleIcon\s+icon=\{role\.icon\}[^>]+>\s*</div>\s*)<div\s+className=\{`absolute\s+\$\{tooltipClass\}\s+w-64([^>]+)`\}>',
    r'\1<div className="absolute top-[110%] right-0 w-64\2">',
    text
)

with open('src/components/game/CenterStage.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
