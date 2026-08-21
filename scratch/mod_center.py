import re

with open('src/components/game/CenterStage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

tooltip_html = '''
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 bg-slate-800/95 border-2 border-slate-500 text-white text-sm leading-relaxed p-3 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none">
                    <div dangerouslySetInnerHTML={{ __html: role.abilityHTML || role.ability }} />
                  </div>'''

# Insert tooltip into Fabled
text = text.replace(
    '<RoleIcon icon={role.icon} className="w-full h-full object-cover bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)]" />\n                    </div>',
    f'<RoleIcon icon={{role.icon}} className="w-full h-full object-cover bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)]" />{tooltip_html}\n                    </div>'
)

# Insert tooltip into Bluffs
text = text.replace(
    '<RoleIcon icon={role.icon} className="w-full h-full object-cover bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)]" />\n                      ) : (',
    f'<RoleIcon icon={{role.icon}} className="w-full h-full object-cover bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)]" />{tooltip_html}\n                      ) : ('
)

# Fix seat guessedRole Tooltip and night orders
def seat_replace(match):
    return match.group(0)

# Actually, it's easier to just do it via standard replace for the seats.
seat_target = '''                      {guessedRole ? (
                        <div className="w-full h-full relative flex flex-col items-center justify-start bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)]">'''

seat_tooltip = '''
                  <div className="absolute top-[110%] left-1/2 -translate-x-1/2 w-64 bg-slate-800/95 border-2 border-slate-500 text-white text-sm leading-relaxed p-3 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none cursor-default text-left">
                    <div dangerouslySetInnerHTML={{ __html: guessedRole.abilityHTML || guessedRole.ability }} />
                  </div>'''

night_orders = '''
                  {(() => {
                    const fIdx = script?.firstNight?.findIndex(x => x.id === guessedRole.id);
                    const oIdx = script?.otherNight?.findIndex(x => x.id === guessedRole.id);
                    const firstNum = fIdx !== undefined && fIdx !== -1 ? fIdx + 1 : null;
                    const otherNum = oIdx !== undefined && oIdx !== -1 ? oIdx + 1 : null;
                    return (
                      <>
                        {firstNum && (
                          <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-400 text-white flex items-center justify-center font-bold shadow-lg z-20">
                            {firstNum}
                          </div>
                        )}
                        {otherNum && (
                          <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-400 text-white flex items-center justify-center font-bold shadow-lg z-20">
                            {otherNum}
                          </div>
                        )}
                      </>
                    );
                  })()}'''

text = text.replace(seat_target, seat_target + seat_tooltip + night_orders)

with open('src/components/game/CenterStage.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
