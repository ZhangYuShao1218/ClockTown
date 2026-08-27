import re

with open('src/components/game/NightOrderModal.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update RolePill container classes
bad_pill = "className={`flex flex-col items-center p-2 rounded-lg border-2 ${color} w-20 shrink-0 shadow-lg group hover:-translate-y-1 transition-transform relative ${isBottom ? 'pt-4' : 'pb-4'}`}"
good_pill = "className={`flex flex-col items-center px-[5px] rounded-lg border-2 ${color} w-[80px] shrink-0 shadow-lg group hover:-translate-y-1 transition-transform relative ${isBottom ? 'pt-4 pb-[5px]' : 'pb-4 pt-[5px]'}`}"
text = text.replace(bad_pill, good_pill)

# 2. Extract badges from icon container and update icon size
bad_icon_block = """      <div className="w-12 h-12 rounded-full border-2 border-white/30 bg-black mb-1 flex items-center justify-center shrink-0 relative overflow-visible">
        <div className="w-full h-full rounded-full overflow-hidden absolute inset-0 flex items-center justify-center">
          {role ? (
            <RoleIcon icon={role.icon} className="w-full h-full object-cover bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)]" />
          ) : (
            <span className="text-2xl font-bold font-serif text-white/80">{item.id === 'minion_info' ? 'M' : 'D'}</span>
          )}
        </div>
        {role?.type === 'demon' && (
          <img src="/icons/demon_badge.png" alt="Demon" className="absolute -top-3 -left-3 w-9 h-9 -rotate-12 drop-shadow-lg z-10" />
        )}
        {role?.type === 'outsider' && (
          <img src="/icons/outsider_badge.png" alt="Outsider" className="absolute -top-3 -left-3 w-9 h-9 -rotate-12 drop-shadow-lg z-10" />
        )}
      </div>"""

good_icon_block = """      {role?.type === 'demon' && (
        <img src="/icons/demon_badge.png" alt="Demon" className="absolute -top-[18px] -left-[18px] w-9 h-9 drop-shadow-lg z-10" />
      )}
      {role?.type === 'outsider' && (
        <img src="/icons/outsider_badge.png" alt="Outsider" className="absolute -top-[18px] -left-[18px] w-9 h-9 drop-shadow-lg z-10" />
      )}
      <div className="w-[70px] h-[70px] rounded-full border-2 border-white/30 bg-black mb-1 flex items-center justify-center shrink-0 relative overflow-visible">
        <div className="w-full h-full rounded-full overflow-hidden absolute inset-0 flex items-center justify-center">
          {role ? (
            <RoleIcon icon={role.icon} className="w-full h-full object-cover bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)]" />
          ) : (
            <span className="text-3xl font-bold font-serif text-white/80">{item.id === 'minion_info' ? 'M' : 'D'}</span>
          )}
        </div>
      </div>"""

text = text.replace(bad_icon_block, good_icon_block)

with open('src/components/game/NightOrderModal.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
