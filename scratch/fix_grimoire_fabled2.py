import re

with open('src/components/game/Grimoire.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Bluffs in Grimoire:
bluff_regex = re.compile(
    r'(className="flex flex-col items-center cursor-pointer group flex-1")(\s*onClick=\{[^\}]+\}\s*>\s*)'
    r'(<div className=\{`w-full aspect-square max-w-\[84px\] rounded-full border-2 flex flex-col items-center justify-center shadow-lg relative overflow-hidden transition-all \$\{roleId \? [^\}]+\}`\}>\s*)'
    r'(\{role \? \(\s*<RoleIcon[^>]+>\s*\)\s*:\s*\(\s*<span[^>]+>\+</span>\s*\)\}\s*)'
    r'(</div>)', re.DOTALL
)

def bluff_repl(m):
    return (
        'className="flex flex-col items-center cursor-pointer group flex-1 relative hover:z-[9999]"' + m.group(2) +
        m.group(3) + m.group(4) + m.group(5) + 
        '\n                    {role && (\n'
        '                      <div className="absolute top-[110%] right-0 w-64 bg-slate-800/95 border-2 border-slate-500 text-white text-sm leading-relaxed p-3 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none text-left cursor-default">\n'
        '                        <div dangerouslySetInnerHTML={{ __html: role.abilityHTML || role.ability }} />\n'
        '                      </div>\n'
        '                    )}'
    )

text = bluff_regex.sub(bluff_repl, text)

# Fabled in Grimoire:
fabled_regex = re.compile(
    r'(className="flex flex-col items-center flex-1 min-w-\[30%\] cursor-pointer group" onClick=\{\(e\)[^\}]+\}\>)'
    r'(\s*<div className="w-full aspect-square max-w-\[84px\] rounded-full border-2 border-yellow-500/50 flex items-center justify-center shadow-lg relative overflow-hidden bg-black/80 group-hover:scale-105 group-hover:border-yellow-400 transition-all">)'
    r'(\s*<RoleIcon[^>]+>)'
    r'(\s*<div[^>]+>🗑</div>)'
    r'(\s*</div>)', re.DOTALL
)

def fabled_repl(m):
    return (
        m.group(1).replace('group"', 'group relative hover:z-[9999]"') + 
        m.group(2) + m.group(3) + m.group(4) + m.group(5) +
        '\n                    {role && (\n'
        '                      <div className="absolute top-[110%] right-0 w-64 bg-slate-800/95 border-2 border-slate-500 text-white text-sm leading-relaxed p-3 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none text-left cursor-default">\n'
        '                        <div dangerouslySetInnerHTML={{ __html: role.abilityHTML || role.ability }} />\n'
        '                      </div>\n'
        '                    )}'
    )

text = fabled_regex.sub(fabled_repl, text)

with open('src/components/game/Grimoire.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
