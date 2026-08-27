import re

with open('src/components/game/RoleInfoModal.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Make dividers more obvious
text = text.replace('border: "border-blue-900/50"', 'border: "border-blue-400/40"')
text = text.replace('border: "border-blue-800/50"', 'border: "border-blue-300/40"')
text = text.replace('border: "border-red-900/50"', 'border: "border-red-400/40"')
text = text.replace('border: "border-rose-900/50"', 'border: "border-red-500/40"')

with open('src/components/game/RoleInfoModal.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

with open('src/components/game/CenterStage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Fix clipping issue in right panel
text = text.replace('overflow-y-auto no-scrollbar', 'overflow-visible')
# Give it slightly more width if it helps, though overflow-visible is enough
text = text.replace('w-[20%]', 'w-[22%]')

with open('src/components/game/CenterStage.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

with open('src/components/game/Grimoire.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Fix clipping issue in right panel
text = text.replace('overflow-y-auto no-scrollbar', 'overflow-visible')
text = text.replace('w-[20%]', 'w-[22%]')

# Add tooltips to Bluffs in Grimoire
bluff_target = """                return (
                  <div 
                    key={i} 
                    className="flex flex-col items-center cursor-pointer group flex-1"
                    onClick={() => openModal("bluff", i)}
                  >
                    <div className={`w-full aspect-square max-w-[84px] rounded-full border-2 flex flex-col items-center justify-center shadow-lg relative overflow-hidden transition-all ${roleId ? 'border-red-900 bg-black hover:border-red-500' : 'border-white/20 bg-black/80 hover:border-white/50'}`}>
                      {role ? (
                        <RoleIcon icon={role.icon} className="w-full h-full object-cover bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)] group-hover:scale-105 transition-transform" />
                      ) : (
                        <span className="text-white/20 text-3xl font-bold">+</span>
                      )}
                    </div>
                    <span className="text-sm font-bold text-red-400/90 uppercase tracking-widest mt-1 truncate w-full text-center">
                      {role ? role.name : "空"}
                    </span>
                  </div>
                );"""

bluff_repl = """                return (
                  <div 
                    key={i} 
                    className="flex flex-col items-center cursor-pointer group flex-1 relative hover:z-[9999]"
                    onClick={() => openModal("bluff", i)}
                  >
                    <div className={`w-full aspect-square max-w-[84px] rounded-full border-2 flex flex-col items-center justify-center shadow-lg relative overflow-hidden transition-all ${roleId ? 'border-red-900 bg-black group-hover:border-red-500' : 'border-white/20 bg-black/80 group-hover:border-white/50'}`}>
                      {role ? (
                        <RoleIcon icon={role.icon} className="w-full h-full object-cover bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)] group-hover:scale-105 transition-transform" />
                      ) : (
                        <span className="text-white/20 text-3xl font-bold">+</span>
                      )}
                    </div>
                    {role && (
                      <div className="absolute top-[110%] right-0 w-64 bg-slate-800/95 border-2 border-slate-500 text-white text-sm leading-relaxed p-3 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none text-left cursor-default">
                        <div dangerouslySetInnerHTML={{ __html: role.abilityHTML || role.ability }} />
                      </div>
                    )}
                    <span className="text-sm font-bold text-red-400/90 uppercase tracking-widest mt-1 truncate w-full text-center">
                      {role ? role.name : "空"}
                    </span>
                  </div>
                );"""

text = text.replace(bluff_target, bluff_repl)

# Add tooltips to Fabled in Grimoire
fabled_target = """                return (
                  <div 
                    key={fId} 
                    className="flex flex-col items-center flex-1 min-w-[30%] cursor-pointer group"
                    onClick={() => openModal("fabled", fId)}
                  >
                    <div className="w-full aspect-square max-w-[84px] rounded-full border-2 border-yellow-500/50 flex flex-col items-center justify-center shadow-lg relative overflow-hidden transition-all group-hover:border-yellow-400 bg-black/50">
                      <RoleIcon icon={role.icon} className="w-full h-full object-cover bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)] group-hover:scale-105 transition-transform" />
                    </div>
                    <span className="text-base font-bold text-yellow-400/90 uppercase tracking-widest mt-1 truncate w-full text-center">{role.name}</span>
                  </div>
                );"""

fabled_repl = """                return (
                  <div 
                    key={fId} 
                    className="flex flex-col items-center flex-1 min-w-[30%] cursor-pointer group relative hover:z-[9999]"
                    onClick={() => openModal("fabled", fId)}
                  >
                    <div className="w-full aspect-square max-w-[84px] rounded-full border-2 border-yellow-500/50 flex flex-col items-center justify-center shadow-lg relative overflow-hidden transition-all group-hover:border-yellow-400 bg-black/50">
                      <RoleIcon icon={role.icon} className="w-full h-full object-cover bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)] group-hover:scale-105 transition-transform" />
                    </div>
                    {role && (
                      <div className="absolute top-[110%] right-0 w-64 bg-slate-800/95 border-2 border-slate-500 text-white text-sm leading-relaxed p-3 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none text-left cursor-default">
                        <div dangerouslySetInnerHTML={{ __html: role.abilityHTML || role.ability }} />
                      </div>
                    )}
                    <span className="text-base font-bold text-yellow-400/90 uppercase tracking-widest mt-1 truncate w-full text-center">{role.name}</span>
                  </div>
                );"""

text = text.replace(fabled_target, fabled_repl)

with open('src/components/game/Grimoire.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
