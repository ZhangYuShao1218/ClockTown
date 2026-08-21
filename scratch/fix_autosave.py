import re

with open('src/components/game/GrimoireSettings.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Replace the problematic useEffect
old_effect = r"  useEffect\(\(\) => \{\n    if \(activeScriptId\) \{\n      setLocalScripts\(prev => \{\n        const updated = prev.map\(s => \{\n          if \(s.id === activeScriptId\) \{\n            return \{\n              \.\.\.s,\n              data: \{ scriptId, seatCount, distribution, bluffs, grimoire: grimoireState, customScript, settings: safeSettings \}\n            \};\n          \}\n          return s;\n        \}\);\n        localStorage.setItem\('botc_local_scripts', JSON.stringify\(updated\)\);\n        return updated;\n      \}\);\n    \}\n  \}, \[scriptId, seatCount, distribution, bluffs, grimoireState, customScript, settings, activeScriptId\]\);"

new_effect = """  const lastActiveScriptId = React.useRef(activeScriptId);
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

c = re.sub(old_effect, new_effect, c)

if 'import React' not in c and 'import * as React' not in c:
    c = c.replace('import { useState', 'import React, { useState')

with open('src/components/game/GrimoireSettings.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("Updated auto-save logic in GrimoireSettings")
