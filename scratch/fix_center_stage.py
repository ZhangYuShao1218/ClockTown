import re

with open('src/components/game/CenterStage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add state for tooltip
if 'hoveredRoleTooltip' not in text:
    text = text.replace(
        'const [activeDropdownSeat, setActiveDropdownSeat] = useState<number | null>(null);',
        'const [activeDropdownSeat, setActiveDropdownSeat] = useState<number | null>(null);\n  const [hoveredRoleTooltip, setHoveredRoleTooltip] = useState<{ role: any, x: number, y: number } | null>(null);'
    )

# 2. Fix the seat dropdown (up vs down)
bad_nameplate = """                  {activeDropdownSeat === seatIndex && (
                    <div className="absolute top-full mt-1 w-24 bg-slate-900 border border-slate-600 rounded-md shadow-xl overflow-hidden z-[100]">"""
# get y from style to determine top/bottom
good_nameplate = """                  {activeDropdownSeat === seatIndex && (
                    <div className={`absolute ${parseInt(style.top as string) > 50 ? 'bottom-full mb-1' : 'top-full mt-1'} w-24 bg-slate-900 border border-slate-600 rounded-md shadow-xl overflow-hidden z-[100]`}>"""

text = text.replace(bad_nameplate, good_nameplate)

# 3. Fix the tooltip logic for seats
# We need to find the `guessedRole && tooltipClass` part
tooltip_pattern = r'\{guessedRole && \(\s*<div className=\{`absolute \$\{tooltipClass\}.*?</div>\s*\)\}'

text = re.sub(tooltip_pattern, '', text, flags=re.DOTALL)

# Add mouse events to the seat circle
bad_circle = """                  <div 
                    className={`relative w-full h-full rounded-full border-4 flex items-center justify-center shadow-lg transition-transform overflow-hidden cursor-pointer pointer-events-auto ${"""

good_circle = """                  <div 
                    onMouseEnter={(e) => {
                      if (guessedRole) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredRoleTooltip({ role: guessedRole, x: rect.left + rect.width / 2, y: rect.bottom });
                      }
                    }}
                    onMouseLeave={() => setHoveredRoleTooltip(null)}
                    className={`relative w-full h-full rounded-full border-4 flex items-center justify-center shadow-lg transition-transform overflow-hidden cursor-pointer pointer-events-auto ${"""
text = text.replace(bad_circle, good_circle)


# 4. Render the tooltip portal at the bottom of CenterStage
portal_code = """      {hoveredRoleTooltip && document.body && createPortal(
        <div className="fixed z-[99999] w-64 bg-slate-900/95 p-3 text-sm border-2 border-slate-500 rounded-xl shadow-2xl pointer-events-none text-left"
            style={{ left: hoveredRoleTooltip.x, top: hoveredRoleTooltip.y + 10, transform: 'translateX(-50%)' }}
          >
            <div className="text-white/80 font-bold leading-relaxed" dangerouslySetInnerHTML={{ __html: hoveredRoleTooltip.role.abilityHTML || hoveredRoleTooltip.role.ability }} />
          </div>,
        document.body
      )}
      <RoleSelectionModal"""

if 'hoveredRoleTooltip && document.body && createPortal' not in text:
    text = text.replace('      <RoleSelectionModal', portal_code)

# Add createPortal to imports if missing
if 'createPortal' not in text:
    text = text.replace('import { useState, useEffect } from \'react\';', 'import { useState, useEffect } from \'react\';\nimport { createPortal } from \'react-dom\';')

with open('src/components/game/CenterStage.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
