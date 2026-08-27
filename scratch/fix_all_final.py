import re

# 1. Fix roomService.ts Firebase undefined bug
with open('src/services/roomService.ts', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace(
    'updates[`rooms/${roomId}/public/customScript`] = setup.customScript;',
    'updates[`rooms/${roomId}/public/customScript`] = setup.customScript !== undefined ? setup.customScript : null;'
)
text = text.replace(
    'updates[`rooms/${roomId}/private/bluffs`] = setup.bluffs;',
    'updates[`rooms/${roomId}/private/bluffs`] = setup.bluffs !== undefined ? setup.bluffs : null;'
)
text = text.replace(
    'updates[`rooms/${roomId}/private/grimoire`] = setup.grimoire;',
    'updates[`rooms/${roomId}/private/grimoire`] = setup.grimoire !== undefined ? setup.grimoire : null;'
)

with open('src/services/roomService.ts', 'w', encoding='utf-8') as f:
    f.write(text)


# 2. Re-apply GrimoireSettings.tsx logic
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
text = re.sub(
    r'const handleSelectScript = async \(s: any\) => \{\s*console\.log\([^)]+\);\s*setActiveScriptId\(s\.id\);\s*await applySetupToRoom\(roomId, s\.data, s\.id\);\s*\};',
    'const handleSelectScript = async (s: any) => {\n    setActiveScriptId(s.id);\n    setIsViewingList(false);\n    await applySetupToRoom(roomId, s.data, s.id);\n  };',
    text
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
      console.log("💾 [Save] 自動存檔觸發。目前 activeScriptId:", activeScriptId, "準備儲存的人數:", seatCount);
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

# Clean up load log
text = re.sub(
    r'try \{ \s*const parsed = JSON\.parse\(saved\);\s*console\.log\("[^"]+", parsed\);\s*setLocalScripts\(parsed\); \s*\} catch \(e\) \{\}',
    'try { setLocalScripts(JSON.parse(saved)); } catch (e) {}',
    text
)

with open('src/components/game/GrimoireSettings.tsx', 'w', encoding='utf-8') as f:
    f.write(text)


# 3. Re-apply Room.tsx logic
with open('src/components/game/Room.tsx', 'r', encoding='utf-8') as f:
    text_room = f.read()

# Add isViewingList state
text_room = text_room.replace(
    'const [activeScriptId, setActiveScriptId] = useState<string | null>(null);',
    'const [activeScriptId, setActiveScriptId] = useState<string | null>(null);\n  const [isViewingList, setIsViewingList] = useState(false);'
)

# Fix useEffect
bad_room_effect = """  useEffect(() => {
    console.log("🌐 [Firebase] 收到雲端 activeSetupId 變更或 Room 重新渲染。雲端:", gameState?.public?.activeSetupId, "本地:", activeScriptId);
    if (gameState?.public?.activeSetupId && !activeScriptId) {
      console.log("⚙️ [Room] 觸發 setActiveScriptId 覆蓋為雲端 ID:", gameState.public.activeSetupId);
      setActiveScriptId(gameState.public.activeSetupId);
    }
  }, [gameState?.public?.activeSetupId, activeScriptId]);"""

good_room_effect = """  useEffect(() => {
    if (gameState?.public?.activeSetupId) {
      setActiveScriptId(gameState.public.activeSetupId);
    }
  }, [gameState?.public?.activeSetupId]);"""

text_room = text_room.replace(bad_room_effect, good_room_effect)

# Update "劇本列表" button
text_room = text_room.replace(
    'onClick={() => { console.log("🔘 [Button] 點擊劇本列表按鈕，設定 activeScriptId = null"); setActiveScriptId(null); }}',
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
