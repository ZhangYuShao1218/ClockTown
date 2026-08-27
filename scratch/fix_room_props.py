import re

with open('src/components/game/Room.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

bad_prop = """                activeScriptId={activeScriptId}
                setActiveScriptId={setActiveScriptId}"""

good_prop = """                activeScriptId={activeScriptId}
                activeSetupId={gameState.public.activeSetupId || null}
                setActiveScriptId={setActiveScriptId}"""

text = text.replace(bad_prop, good_prop)

with open('src/components/game/Room.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
