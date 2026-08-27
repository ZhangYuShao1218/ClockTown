import re

#######################
# CenterStage.tsx
#######################
with open('src/components/game/CenterStage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Add hoveredSeat state and clear event
text = text.replace(
    '  const [seatRoleNotes, setSeatRoleNotes] = useState<Record<number, string>>({});',
    '  const [seatRoleNotes, setSeatRoleNotes] = useState<Record<number, string>>({});\n  const [hoveredSeat, setHoveredSeat] = useState<number | null>(null);\n\n  useEffect(() => {\n    const handleClear = () => {\n      setSeatRoleNotes({});\n      setSeatNotes({});\n      if (userUid) {\n        localStorage.removeItem(`botc_role_notes_${userUid}`);\n        localStorage.removeItem(`botc_notes_${userUid}`);\n      }\n    };\n    window.addEventListener(\'clear-local-notes\', handleClear);\n    return () => window.removeEventListener(\'clear-local-notes\', handleClear);\n  }, [userUid]);'
)

# Update getSeatConfig to include badgeClass
bad_config = """  const getSeatConfig = () => {
    const count = typeof totalSeats !== 'undefined' ? totalSeats : seatCount;
    if (count <= 6) return { size: 170, radius: 36 };
    if (count <= 8) return { size: 160, radius: 38 };
    if (count <= 10) return { size: 150, radius: 40 };
    if (count <= 12) return { size: 140, radius: 42 };
    if (count <= 14) return { size: 130, radius: 43.5 };
    return { size: 120, radius: 45 };
  };"""

good_config = """  const getSeatConfig = () => {
    const count = typeof totalSeats !== 'undefined' ? totalSeats : seatCount;
    if (count <= 6) return { size: 170, radius: 36, badgeClass: 'w-11 h-11 text-xl' };
    if (count <= 8) return { size: 160, radius: 38, badgeClass: 'w-10 h-10 text-lg' };
    if (count <= 10) return { size: 150, radius: 40, badgeClass: 'w-9 h-9 text-base' };
    if (count <= 12) return { size: 140, radius: 42, badgeClass: 'w-9 h-9 text-base' };
    if (count <= 14) return { size: 130, radius: 43.5, badgeClass: 'w-8 h-8 text-sm' };
    return { size: 120, radius: 45, badgeClass: 'w-8 h-8 text-sm' };
  };"""

text = text.replace(bad_config, good_config)

# Remove badges from first loop and add hover state
bad_loop = """            return (
              <div 
                key={seatIndex}
                className="absolute group z-10 hover:z-[9999]"
                style={style}
              >
                {guessedRole && (() => {
                    const fIdx = script?.firstNight?.findIndex(x => x.id === guessedRole.id);
                    const oIdx = script?.otherNight?.findIndex(x => x.id === guessedRole.id);
                    const firstNum = fIdx !== undefined && fIdx !== -1 ? fIdx + 1 : null;
                    const otherNum = oIdx !== undefined && oIdx !== -1 ? oIdx + 1 : null;
                    return (
                      <>
                        {firstNum && (
                          <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-blue-900 border-2 border-blue-400 text-blue-100 flex items-center justify-center font-bold shadow-xl z-20 pointer-events-none">
                            {firstNum}
                          </div>
                        )}
                        {otherNum && (
                          <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-red-900 border-2 border-red-400 text-red-100 flex items-center justify-center font-bold shadow-xl z-20 pointer-events-none">
                            {otherNum}
                          </div>
                        )}
                        <div className={`absolute ${tooltipClass} w-64 bg-slate-800/95 border-2 border-slate-500 text-white text-sm leading-relaxed p-3 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none text-left cursor-default`}>
                          <div dangerouslySetInnerHTML={{ __html: guessedRole.abilityHTML || guessedRole.ability }} />
                        </div>
                      </>
                    );
                })()}"""

good_loop = """            return (
              <div 
                key={seatIndex}
                className={`absolute group transition-all ${hoveredSeat === seatIndex ? 'z-[9999]' : 'z-10'}`}
                style={style}
                onMouseEnter={() => setHoveredSeat(seatIndex)}
                onMouseLeave={() => setHoveredSeat(null)}
              >
                {guessedRole && (
                    <div className={`absolute ${tooltipClass} w-64 bg-slate-800/95 border-2 border-slate-500 text-white text-sm leading-relaxed p-3 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none text-left cursor-default`}>
                      <div dangerouslySetInnerHTML={{ __html: guessedRole.abilityHTML || guessedRole.ability }} />
                    </div>
                )}"""

text = text.replace(bad_loop, good_loop)


# Add badges mapping loop
nameplate_start = """            {/* Render seat text independently so it stays on top of all circles */}
            {seats.map((seatIndex) => {"""

badges_loop = """            {/* Night Order Badges */}
            {seats.map((seatIndex) => {
              const guessedRoleId = seatRoleNotes[seatIndex] || null;
              const guessedRole = guessedRoleId ? Object.values(AllRoles).find(r => r.id === guessedRoleId) : null;
              if (!guessedRole) return null;

              const fIdx = script?.firstNight?.findIndex(x => x.id === guessedRole.id);
              const oIdx = script?.otherNight?.findIndex(x => x.id === guessedRole.id);
              const firstNum = fIdx !== undefined && fIdx !== -1 ? fIdx + 1 : null;
              const otherNum = oIdx !== undefined && oIdx !== -1 ? oIdx + 1 : null;

              if (!firstNum && !otherNum) return null;

              const style = getSeatStyle(seatIndex);
              const { badgeClass } = getSeatConfig();

              return (
                <div 
                  key={`badge-${seatIndex}`}
                  className={`absolute pointer-events-none ${hoveredSeat === seatIndex ? 'z-[10000]' : 'z-30'}`}
                  style={style}
                >
                  {firstNum && (
                    <div className={`absolute left-[-10px] top-1/2 -translate-y-1/2 ${badgeClass} rounded-full bg-blue-900 border-2 border-blue-400 text-blue-100 flex items-center justify-center font-bold shadow-xl`}>
                      {firstNum}
                    </div>
                  )}
                  {otherNum && (
                    <div className={`absolute right-[-10px] top-1/2 -translate-y-1/2 ${badgeClass} rounded-full bg-red-900 border-2 border-red-400 text-red-100 flex items-center justify-center font-bold shadow-xl`}>
                      {otherNum}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Render seat text independently so it stays on top of all circles */}
            {seats.map((seatIndex) => {"""

text = text.replace(nameplate_start, badges_loop)

with open('src/components/game/CenterStage.tsx', 'w', encoding='utf-8') as f:
    f.write(text)


#######################
# Grimoire.tsx
#######################
with open('src/components/game/Grimoire.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Add hoveredSeat state
text = text.replace(
    '  const { user } = useAuth();',
    '  const { user } = useAuth();\n  const [hoveredSeat, setHoveredSeat] = useState<number | null>(null);'
)

# Replace getSeatConfig
text = text.replace(bad_config, good_config)

# Remove badges from first loop and add hover state
bad_loop_grim = """            return (
              <div 
                key={seatIndex}
                className="absolute group z-10 hover:z-[9999]"
                style={style}
              >
                {role && (() => {
                    const fIdx = script?.firstNight?.findIndex(x => x.id === role.id);
                    const oIdx = script?.otherNight?.findIndex(x => x.id === role.id);
                    const firstNum = fIdx !== undefined && fIdx !== -1 ? fIdx + 1 : null;
                    const otherNum = oIdx !== undefined && oIdx !== -1 ? oIdx + 1 : null;
                    return (
                      <>
                        {firstNum && (
                          <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-blue-900 border-2 border-blue-400 text-blue-100 flex items-center justify-center font-bold shadow-xl z-20 pointer-events-none">
                            {firstNum}
                          </div>
                        )}
                        {otherNum && (
                          <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-red-900 border-2 border-red-400 text-red-100 flex items-center justify-center font-bold shadow-xl z-20 pointer-events-none">
                            {otherNum}
                          </div>
                        )}
                        <div className={`absolute ${tooltipClass} w-64 bg-slate-800/95 border-2 border-slate-500 text-white text-sm leading-relaxed p-3 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none text-left cursor-default`}>
                          <div dangerouslySetInnerHTML={{ __html: role.abilityHTML || role.ability }} />
                        </div>
                      </>
                    );
                })()}"""

good_loop_grim = """            return (
              <div 
                key={seatIndex}
                className={`absolute group transition-all ${hoveredSeat === seatIndex ? 'z-[9999]' : 'z-10'}`}
                style={style}
                onMouseEnter={() => setHoveredSeat(seatIndex)}
                onMouseLeave={() => setHoveredSeat(null)}
              >
                {role && (
                    <div className={`absolute ${tooltipClass} w-64 bg-slate-800/95 border-2 border-slate-500 text-white text-sm leading-relaxed p-3 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none text-left cursor-default`}>
                      <div dangerouslySetInnerHTML={{ __html: role.abilityHTML || role.ability }} />
                    </div>
                )}"""

text = text.replace(bad_loop_grim, good_loop_grim)

badges_loop_grim = """            {/* Night Order Badges */}
            {seats.map((seatIndex) => {
              const role = seatRoles[seatIndex];
              if (!role) return null;

              const fIdx = script?.firstNight?.findIndex(x => x.id === role.id);
              const oIdx = script?.otherNight?.findIndex(x => x.id === role.id);
              const firstNum = fIdx !== undefined && fIdx !== -1 ? fIdx + 1 : null;
              const otherNum = oIdx !== undefined && oIdx !== -1 ? oIdx + 1 : null;

              if (!firstNum && !otherNum) return null;

              const style = getSeatStyle(seatIndex);
              const { badgeClass } = getSeatConfig();

              return (
                <div 
                  key={`badge-${seatIndex}`}
                  className={`absolute pointer-events-none ${hoveredSeat === seatIndex ? 'z-[10000]' : 'z-30'}`}
                  style={style}
                >
                  {firstNum && (
                    <div className={`absolute left-[-10px] top-1/2 -translate-y-1/2 ${badgeClass} rounded-full bg-blue-900 border-2 border-blue-400 text-blue-100 flex items-center justify-center font-bold shadow-xl`}>
                      {firstNum}
                    </div>
                  )}
                  {otherNum && (
                    <div className={`absolute right-[-10px] top-1/2 -translate-y-1/2 ${badgeClass} rounded-full bg-red-900 border-2 border-red-400 text-red-100 flex items-center justify-center font-bold shadow-xl`}>
                      {otherNum}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Render seat text independently so it stays on top of all circles */}
            {seats.map((seatIndex) => {"""

text = text.replace(nameplate_start, badges_loop_grim)

with open('src/components/game/Grimoire.tsx', 'w', encoding='utf-8') as f:
    f.write(text)


#######################
# Room.tsx (Clear button)
#######################
with open('src/components/game/Room.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace(
    '<button className="px-4 py-3 text-white/80 hover:bg-blue-500/30 hover:text-blue-200 text-center font-bold tracking-widest text-base transition-colors">投票紀錄</button>',
    '<button className="px-4 py-3 text-white/80 hover:bg-blue-500/30 hover:text-blue-200 text-center font-bold tracking-widest text-base transition-colors border-b border-white/10">投票紀錄</button>\n            <button onClick={() => { if(window.confirm(\'確定要清空所有自行標記的角色與筆記嗎？\')) window.dispatchEvent(new CustomEvent(\'clear-local-notes\')); }} className="px-4 py-3 text-red-400 hover:bg-red-500/30 hover:text-red-200 text-center font-bold tracking-widest text-base transition-colors">清空資料</button>'
)

with open('src/components/game/Room.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
