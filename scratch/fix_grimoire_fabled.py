import re

with open('src/components/game/Grimoire.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

fabled_target = """                  <div key={fId} className="flex flex-col items-center flex-1 min-w-[30%] cursor-pointer group" onClick={(e) => { e.stopPropagation(); onRemoveFabled(fId); }}>
                    <div className="w-full aspect-square max-w-[84px] rounded-full border-2 border-yellow-500/50 flex items-center justify-center shadow-lg relative overflow-hidden bg-black/80 group-hover:scale-105 group-hover:border-yellow-400 transition-all">
                      <RoleIcon icon={role.icon} className="w-full h-full object-cover bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)]" />
                      <div className="absolute inset-0 bg-red-900/80 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity text-xl font-bold">🗑</div>
                    </div>
                    <span className="text-base font-bold text-yellow-400/90 uppercase tracking-widest mt-1 truncate w-full text-center">{role.name}</span>
                  </div>"""

fabled_repl = """                  <div key={fId} className="flex flex-col items-center flex-1 min-w-[30%] cursor-pointer group relative hover:z-[9999]" onClick={(e) => { e.stopPropagation(); onRemoveFabled(fId); }}>
                    <div className="w-full aspect-square max-w-[84px] rounded-full border-2 border-yellow-500/50 flex items-center justify-center shadow-lg relative overflow-hidden bg-black/80 group-hover:scale-105 group-hover:border-yellow-400 transition-all">
                      <RoleIcon icon={role.icon} className="w-full h-full object-cover bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)]" />
                      <div className="absolute inset-0 bg-red-900/80 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity text-xl font-bold">🗑</div>
                    </div>
                    {role && (
                      <div className="absolute top-[110%] right-0 w-64 bg-slate-800/95 border-2 border-slate-500 text-white text-sm leading-relaxed p-3 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none text-left cursor-default">
                        <div dangerouslySetInnerHTML={{ __html: role.abilityHTML || role.ability }} />
                      </div>
                    )}
                    <span className="text-base font-bold text-yellow-400/90 uppercase tracking-widest mt-1 truncate w-full text-center">{role.name}</span>
                  </div>"""

text = text.replace(fabled_target, fabled_repl)

with open('src/components/game/Grimoire.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
