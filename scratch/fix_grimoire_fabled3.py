import re

with open('src/components/game/Grimoire.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace Bluffs hover wrapper
bad_bluff_wrapper = 'className="flex flex-col items-center cursor-pointer group flex-1"'
good_bluff_wrapper = 'className="flex flex-col items-center cursor-pointer group flex-1 relative hover:z-[9999]"'
text = text.replace(bad_bluff_wrapper, good_bluff_wrapper)

# Replace Bluffs icon container to add tooltip
bad_bluff_icon = """                      {role ? (
                        <RoleIcon icon={role.icon} className="w-full h-full object-cover bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)] group-hover:scale-105 transition-transform" />
                      ) : (
                        <span className="text-white/20 text-3xl font-bold">+</span>
                      )}
                    </div>"""

good_bluff_icon = """                      {role ? (
                        <RoleIcon icon={role.icon} className="w-full h-full object-cover bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)] group-hover:scale-105 transition-transform" />
                      ) : (
                        <span className="text-white/20 text-3xl font-bold">+</span>
                      )}
                    </div>
                    {role && (
                      <div className="absolute top-[110%] right-0 w-64 bg-slate-800/95 border-2 border-slate-500 text-white text-sm leading-relaxed p-3 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none text-left cursor-default">
                        <div dangerouslySetInnerHTML={{ __html: role.abilityHTML || role.ability }} />
                      </div>
                    )}"""
text = text.replace(bad_bluff_icon, good_bluff_icon)


# Replace Fabled hover wrapper
bad_fabled_wrapper = 'className="flex flex-col items-center flex-1 min-w-[30%] cursor-pointer group"'
# Wait, this matches BOTH the fabled items AND the Add Fabled button.
# Let's see: The Add Fabled button doesn't have a role, so even if we add hover:z-[9999] it's fine.
good_fabled_wrapper = 'className="flex flex-col items-center flex-1 min-w-[30%] cursor-pointer group relative hover:z-[9999]"'
text = text.replace(bad_fabled_wrapper, good_fabled_wrapper)

# Replace Fabled icon container to add tooltip
bad_fabled_icon = """                      <div className="absolute inset-0 bg-red-900/80 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity text-xl font-bold">🗑</div>
                    </div>"""

good_fabled_icon = """                      <div className="absolute inset-0 bg-red-900/80 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity text-xl font-bold">🗑</div>
                    </div>
                    {role && (
                      <div className="absolute top-[110%] right-0 w-64 bg-slate-800/95 border-2 border-slate-500 text-white text-sm leading-relaxed p-3 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none text-left cursor-default">
                        <div dangerouslySetInnerHTML={{ __html: role.abilityHTML || role.ability }} />
                      </div>
                    )}"""
text = text.replace(bad_fabled_icon, good_fabled_icon)

with open('src/components/game/Grimoire.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
