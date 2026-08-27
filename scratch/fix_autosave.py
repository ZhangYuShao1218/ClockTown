import re

# 1. Update GrimoireSettings.tsx
with open('src/components/game/GrimoireSettings.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Add activeSetupId to props
text = text.replace("activeScriptId: string | null;", "activeScriptId: string | null;\n  activeSetupId: string | null;")
text = text.replace("  activeScriptId,\n  setActiveScriptId,\n  settings\n}: GrimoireSettingsProps) => {", "  activeScriptId,\n  activeSetupId,\n  setActiveScriptId,\n  settings\n}: GrimoireSettingsProps) => {")

# Replace the broken useEffect
bad_effect = """  const lastActiveScriptId = React.useRef(activeScriptId);
  const skipNextSave = React.useRef(false);

  useEffect(() => {
    if (activeScriptId !== lastActiveScriptId.current) {
      lastActiveScriptId.current = activeScriptId;
      skipNextSave.current = true;
      return;
    }

    if (activeScriptId && !skipNextSave.current) {
      setLocalScripts(prev => {
        const updated = prev.map(s => {
          if (s.id === activeScriptId) {
            return {
              ...s,
              data: { scriptId, seatCount, distribution, bluffs, grimoire: grimoireState, customScript, settings: safeSettings }
            };
          }
          return s;
        });
        localStorage.setItem('botc_local_scripts', JSON.stringify(updated));
        return updated;
      });
    }
    
    if (skipNextSave.current) {
        // We wait for the room data to match what we just loaded.
        // Actually, just giving it a short timeout or waiting for next render is enough.
        skipNextSave.current = false;
    }
  }, [scriptId, seatCount, distribution, bluffs, grimoireState, customScript, settings, activeScriptId]);"""

good_effect = """  useEffect(() => {
    // Only auto-save if the current script is active AND Firebase has fully synced it
    if (activeScriptId && activeScriptId === activeSetupId) {
      setLocalScripts(prev => {
        let isChanged = false;
        const updated = prev.map(s => {
          if (s.id === activeScriptId) {
            isChanged = true;
            return {
              ...s,
              data: { scriptId, seatCount, distribution, bluffs, grimoire: grimoireState, customScript, settings: safeSettings }
            };
          }
          return s;
        });
        if (isChanged) {
          localStorage.setItem('botc_local_scripts', JSON.stringify(updated));
        }
        return updated;
      });
    }
  }, [scriptId, seatCount, distribution, bluffs, grimoireState, customScript, settings, activeScriptId, activeSetupId]);"""

text = text.replace(bad_effect, good_effect)

with open('src/components/game/GrimoireSettings.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

# 2. Update Room.tsx
with open('src/components/game/Room.tsx', 'r', encoding='utf-8') as f:
    text_room = f.read()

# Pass activeSetupId
text_room = text_room.replace("activeScriptId={activeScriptId}\n                setActiveScriptId={setActiveScriptId}", "activeScriptId={activeScriptId}\n                activeSetupId={gameState.public.activeSetupId || null}\n                setActiveScriptId={setActiveScriptId}")

# Fix the useEffect missing dependency which might cause the refresh bug
bad_room_effect = """  useEffect(() => {
    if (gameState?.public?.activeSetupId && !activeScriptId) {
      setActiveScriptId(gameState.public.activeSetupId);
    }
  }, [gameState?.public?.activeSetupId]);"""

good_room_effect = """  useEffect(() => {
    if (gameState?.public?.activeSetupId && !activeScriptId) {
      setActiveScriptId(gameState.public.activeSetupId);
    }
  }, [gameState?.public?.activeSetupId, activeScriptId]);"""

text_room = text_room.replace(bad_room_effect, good_room_effect)

with open('src/components/game/Room.tsx', 'w', encoding='utf-8') as f:
    f.write(text_room)
