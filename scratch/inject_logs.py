import re

with open('src/components/game/GrimoireSettings.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Log loading scripts
text = text.replace(
    'try { setLocalScripts(JSON.parse(saved)); } catch (e) {}',
    'try { \n        const parsed = JSON.parse(saved);\n        console.log("📥 [Load] 從 localStorage 讀取本地存檔 localScripts:", parsed);\n        setLocalScripts(parsed); \n      } catch (e) {}'
)

# 2. Log selecting a script
text = text.replace(
    '  const handleSelectScript = async (s: any) => {\n    setActiveScriptId(s.id);\n    await applySetupToRoom(roomId, s.data, s.id);\n  };',
    '  const handleSelectScript = async (s: any) => {\n    console.log("🔄 [Select] 點擊切換劇本。目標劇本:", s.name, "目標人數:", s.data.seatCount, "當前 activeScriptId:", activeScriptId);\n    setActiveScriptId(s.id);\n    await applySetupToRoom(roomId, s.data, s.id);\n  };'
)

# 3. Log auto-save
# We have this block in GrimoireSettings.tsx:
#     if (activeScriptId && !skipNextSave.current) {
#       setLocalScripts(prev => {
text = text.replace(
    '    if (activeScriptId && !skipNextSave.current) {\n      setLocalScripts(prev => {',
    '    if (activeScriptId && !skipNextSave.current) {\n      console.log("💾 [Save] 自動存檔觸發。目前 activeScriptId:", activeScriptId, "準備儲存的人數:", seatCount);\n      setLocalScripts(prev => {'
)

with open('src/components/game/GrimoireSettings.tsx', 'w', encoding='utf-8') as f:
    f.write(text)


with open('src/components/game/Room.tsx', 'r', encoding='utf-8') as f:
    text_room = f.read()

# 4. Log Firebase activeSetupId change and Room.tsx's reaction
text_room = text_room.replace(
    '  useEffect(() => {\n    if (gameState?.public?.activeSetupId && !activeScriptId) {\n      setActiveScriptId(gameState.public.activeSetupId);\n    }\n  }, [gameState?.public?.activeSetupId, activeScriptId]);',
    '  useEffect(() => {\n    console.log("🌐 [Firebase] 收到雲端 activeSetupId 變更或 Room 重新渲染。雲端:", gameState?.public?.activeSetupId, "本地:", activeScriptId);\n    if (gameState?.public?.activeSetupId && !activeScriptId) {\n      console.log("⚙️ [Room] 觸發 setActiveScriptId 覆蓋為雲端 ID:", gameState.public.activeSetupId);\n      setActiveScriptId(gameState.public.activeSetupId);\n    }\n  }, [gameState?.public?.activeSetupId, activeScriptId]);'
)

# 5. Log script list button click
text_room = text_room.replace(
    'onClick={() => setActiveScriptId(null)}',
    'onClick={() => { console.log("🔘 [Button] 點擊劇本列表按鈕，設定 activeScriptId = null"); setActiveScriptId(null); }}'
)


with open('src/components/game/Room.tsx', 'w', encoding='utf-8') as f:
    f.write(text_room)
