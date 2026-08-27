import re

with open('src/components/game/Room.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Add useRef to import if not present
if 'useRef' not in text:
    text = text.replace('import { useState, useEffect }', 'import { useState, useEffect, useRef }')

# Add hasInitialized ref
if 'const hasInitialized = useRef(false);' not in text:
    text = text.replace('const [activeScriptId, setActiveScriptId] = useState<string | null>(null);', 'const [activeScriptId, setActiveScriptId] = useState<string | null>(null);\n  const hasInitialized = useRef(false);')

# Fix the useEffect
bad_effect = """  useEffect(() => {
    if (gameState?.public?.activeSetupId && !activeScriptId) {
      setActiveScriptId(gameState.public.activeSetupId);
    }
  }, [gameState?.public?.activeSetupId, activeScriptId]);"""

good_effect = """  useEffect(() => {
    if (gameState?.public?.activeSetupId && !hasInitialized.current) {
      setActiveScriptId(gameState.public.activeSetupId);
      hasInitialized.current = true;
    }
  }, [gameState?.public?.activeSetupId]);"""

text = text.replace(bad_effect, good_effect)

with open('src/components/game/Room.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
