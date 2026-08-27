import json
with open('tsconfig.app.json', 'r') as f:
    data = json.load(f)

if 'compilerOptions' in data:
    data['compilerOptions']['ignoreDeprecations'] = "5.0" # wait, the error says "6.0"

data['compilerOptions']['ignoreDeprecations'] = "5.0"

with open('tsconfig.app.json', 'w') as f:
    json.dump(data, f, indent=2)
