import re

# 1. Update GrimoireSettings.tsx
with open('src/components/game/GrimoireSettings.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Props interface
text = text.replace(
    '  activeScriptId: string | null;\n  setActiveScriptId: (id: string | null) => void;\n  settings: any;\n}',
    '  activeScriptId: string | null;\n  activeSetupId: string | null;\n  setActiveScriptId: (id: string | null) => void;\n  isViewingList: boolean;\n  setIsViewingList: (val: boolean) => void;\n  settings: any;\n}'
)

# Component params
text = text.replace(
    '  activeScriptId,\n  setActiveScriptId,\n  settings\n}: GrimoireSettingsProps)',
    '  activeScriptId,\n  activeSetupId,\n  setActiveScriptId,\n  isViewingList,\n  setIsViewingList,\n  settings\n}: GrimoireSettingsProps)'
)

# Rendering list condition
text = text.replace('  if (!activeScriptId) {', '  if (isViewingList || !activeScriptId) {')

# Selecting a script
text = text.replace(
    '  const handleSelectScript = async (s: any) => {\n    setActiveScriptId(s.id);\n    await applySetupToRoom(roomId, s.data, s.id);\n  };',
    '  const handleSelectScript = async (s: any) => {\n    setActiveScriptId(s.id);\n    setIsViewingList(false);\n    await applySetupToRoom(roomId, s.data, s.id);\n  };'
)

# Auto-save logic
bad_auto_save = """  const lastActiveScriptId = React.useRef(activeScriptId);
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

good_auto_save = """  useEffect(() => {
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

text = text.replace(bad_auto_save, good_auto_save)

with open('src/components/game/GrimoireSettings.tsx', 'w', encoding='utf-8') as f:
    f.write(text)


# 2. Update Room.tsx
with open('src/components/game/Room.tsx', 'r', encoding='utf-8') as f:
    text_room = f.read()

# Add isViewingList state
text_room = text_room.replace(
    'const [activeScriptId, setActiveScriptId] = useState<string | null>(null);',
    'const [activeScriptId, setActiveScriptId] = useState<string | null>(null);\n  const [isViewingList, setIsViewingList] = useState(false);'
)

# Fix useEffect to just sync activeSetupId unconditionally (no hasInitialized ref needed)
bad_room_effect = """  useEffect(() => {
    if (gameState?.public?.activeSetupId && !activeScriptId) {
      setActiveScriptId(gameState.public.activeSetupId);
    }
  }, [gameState?.public?.activeSetupId]);"""

good_room_effect = """  useEffect(() => {
    if (gameState?.public?.activeSetupId) {
      setActiveScriptId(gameState.public.activeSetupId);
    }
  }, [gameState?.public?.activeSetupId]);"""

text_room = text_room.replace(bad_room_effect, good_room_effect)

# Update "劇本列表" button
text_room = text_room.replace(
    'onClick={() => setActiveScriptId(null)}',
    'onClick={() => setIsViewingList(true)}'
)

# Pass props to GrimoireSettings
bad_grimoire_settings_props = """              activeScriptId={activeScriptId}
              setActiveScriptId={setActiveScriptId}
              settings={gameState.public.settings}"""

good_grimoire_settings_props = """              activeScriptId={activeScriptId}
              activeSetupId={gameState.public.activeSetupId || null}
              setActiveScriptId={setActiveScriptId}
              isViewingList={isViewingList}
              setIsViewingList={setIsViewingList}
              settings={gameState.public.settings}"""

text_room = text_room.replace(bad_grimoire_settings_props, good_grimoire_settings_props)

with open('src/components/game/Room.tsx', 'w', encoding='utf-8') as f:
    f.write(text_room)
