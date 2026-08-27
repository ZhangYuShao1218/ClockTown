import re

with open('src/components/game/Room.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace placeholder with Chat component
text = re.sub(
    r'<div className="flex flex-col h-full bg-black/40">.*?</div>\s*</div>\s*</div>\s*</div>\s*\)\}\s*</div>',
    r'<Chat roomId={id!} userUid={user?.uid!} userName={user?.displayName || \'Unknown\'} isHost={isHost} players={players} hostPlayer={hostPlayer} />\n              </div>\n            </div>\n          )}\n        </div>',
    text,
    flags=re.DOTALL
)

with open('src/components/game/Room.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
