import re

with open('src/services/roomService.ts', 'r', encoding='utf-8') as f:
    text = f.read()

bad_flavor_logic = """        let flavor = "";
        if (roleDef.type === 'demon' || roleDef.type === 'minion') {
          flavor = `你是黑鍾鎮隱藏的邪惡存在 一段被遺忘的過去\\n人們是如此稱呼你 ${roleDef.name}\\n\\n`;
        } else {
          flavor = `你是這迷霧重重的黑鍾鎮中，尋求真相與希望的光芒\\n人們是如此稱呼你 ${roleDef.name}\\n\\n`;
        }"""

good_flavor_logic = """        let flavor = roleDef.flavor ? `${roleDef.flavor}\\n\\n` : `你是這迷霧重重的黑鍾鎮中，尋求真相與希望的光芒\\n人們是如此稱呼你 ${roleDef.name}\\n\\n`;"""

text = text.replace(bad_flavor_logic, good_flavor_logic)

with open('src/services/roomService.ts', 'w', encoding='utf-8') as f:
    f.write(text)
