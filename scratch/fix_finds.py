import re
import glob

for filepath in glob.glob('src/**/*.tsx', recursive=True) + glob.glob('src/**/*.ts', recursive=True):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'AllRoles.find(' in content:
        content = content.replace('AllRoles.find(', 'Object.values(AllRoles).find(')
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

    if 'AllScripts.find(' in content:
        content = content.replace('AllScripts.find(', 'Object.values(AllScripts).find(')
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
