import re

with open('src/components/game/Grimoire.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add state for tooltip
if 'hoveredRoleTooltip' not in text:
    text = text.replace(
        'const [targetSeat, setTargetSeat] = useState<number | null>(null);',
        'const [targetSeat, setTargetSeat] = useState<number | null>(null);\n  const [hoveredRoleTooltip, setHoveredRoleTooltip] = useState<{ role: any, x: number, y: number } | null>(null);'
    )

# 2. Fix tooltip logic for seats
tooltip_pattern = r'\{role && \(\s*<div className=\{`absolute \$\{tooltipClass\}.*?</div>\s*\)\}'
text = re.sub(tooltip_pattern, '', text, flags=re.DOTALL)

# Add mouse events to the seat circle button
bad_circle = """                  <div className={`w-full h-full rounded-full border-4 flex items-center justify-center shadow-2xl relative overflow-hidden bg-black/90 transition-colors ${role ? (isEvil ? 'border-red-900 hover:border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 'border-blue-900 hover:border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)]') : 'border-white/20 hover:border-white/50'}`}>"""

good_circle = """                  <div 
                    onMouseEnter={(e) => {
                      if (role) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredRoleTooltip({ role: role, x: rect.left + rect.width / 2, y: rect.bottom });
                      }
                    }}
                    onMouseLeave={() => setHoveredRoleTooltip(null)}
                    className={`w-full h-full rounded-full border-4 flex items-center justify-center shadow-2xl relative overflow-hidden bg-black/90 transition-colors ${role ? (isEvil ? 'border-red-900 hover:border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 'border-blue-900 hover:border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)]') : 'border-white/20 hover:border-white/50'}`}>"""

text = text.replace(bad_circle, good_circle)

# 3. Fix tooltip logic for bluffs/fabled
# We should probably do this for bluffs and fabled too but the user only explicitly said "座位如果有角色hover" 
# To be safe, we leave them as group-hover since they don't overlap with seat map loops and z-10 contexts in the same way.

# 4. Render the tooltip portal at the bottom of Grimoire
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
    text = text.replace('import { useState } from \'react\';', 'import { useState } from \'react\';\nimport { createPortal } from \'react-dom\';')


# 5. Same pointer-events fix for Nameplates in Grimoire
bad_nameplate_wrapper = """              <div 
                key={`text-${seatIndex}`}
                className="absolute z-50 pointer-events-auto"
                style={style}
              >
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-max flex flex-col items-center justify-center">"""

good_nameplate_wrapper = """              <div 
                key={`text-${seatIndex}`}
                className="absolute z-50 pointer-events-none"
                style={style}
              >
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-max flex flex-col items-center justify-center pointer-events-auto">"""
text = text.replace(bad_nameplate_wrapper, good_nameplate_wrapper)

with open('src/components/game/Grimoire.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
