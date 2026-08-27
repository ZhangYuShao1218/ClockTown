import re

with open('src/components/game/NightOrderModal.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

bad_rolepill = re.search(r"const RolePill = \(\{ item, isBottom \}: \{ item: any; isBottom\?: boolean \}\) => \{.*?\n\};\n", text, re.DOTALL)

good_rolepill = """const RolePill = ({ item, isBottom }: { item: any; isBottom?: boolean }) => {
  const role = AllRoles[item.id as keyof typeof AllRoles];
  
  const pillStyles: Record<string, { outer: string, inner: string }> = {
    'townsfolk': { outer: 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]', inner: 'bg-slate-900/95' },
    'outsider': { outer: 'bg-gradient-to-br from-blue-400 from-60% to-red-600 shadow-[0_0_10px_rgba(96,165,250,0.4)]', inner: 'bg-slate-900/95' },
    'minion': { outer: 'bg-red-800 shadow-[0_0_10px_rgba(153,27,27,0.4)]', inner: 'bg-slate-900/95' },
    'demon': { outer: 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]', inner: 'bg-slate-900/95' },
    'info': { outer: 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]', inner: 'bg-slate-900/95' }
  };

  const type = role?.type || item.type || 'info';
  const style = pillStyles[type] || pillStyles['info'];

  let abilityHTML = role?.abilityHTML || role?.ability || '';
  if (item.id === 'minion_info') {
    abilityHTML = '如果場上有爪牙玩家，你得知<span class="highlight-evil">惡魔</span>以及其他爪牙偽裝的身分。';
  } else if (item.id === 'demon_info') {
    abilityHTML = '如果場上有爪牙玩家，惡魔會得知<span class="highlight-evil">爪牙</span>，並得知三個不在場的<span class="highlight-good">善良陣營</span>角色。';
  }

  return (
    <div className={`p-[2px] rounded-lg w-[80px] shrink-0 shadow-lg group hover:-translate-y-1 transition-transform relative ${style.outer}`}>
      <div className={`flex flex-col items-center px-[3px] pt-[3px] pb-2 rounded-[6px] w-full h-full ${style.inner}`}>
        
        {/* Tooltip */}
        <div className={`absolute ${isBottom ? 'top-full mt-2' : 'bottom-full mb-2'} left-1/2 -translate-x-1/2 w-48 bg-slate-800/95 border-2 border-slate-500 text-white text-xs leading-relaxed p-3 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none`}>
          <div dangerouslySetInnerHTML={{ __html: abilityHTML }} />
        </div>

        {!isBottom && <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/20"></div>}
        {isBottom && <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/20"></div>}

        <div className="w-[70px] h-[70px] rounded-full border-2 border-white/30 bg-black mb-1 flex items-center justify-center shrink-0 relative overflow-visible">
          <div className="w-full h-full rounded-full overflow-hidden absolute inset-0 flex items-center justify-center">
            {role ? (
              <RoleIcon icon={role.icon} className="w-full h-full object-cover bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)]" />
            ) : (
              <span className="text-3xl font-bold font-serif text-white/80">{item.id === 'minion_info' ? 'M' : 'D'}</span>
            )}
          </div>
        </div>

        <span className="text-xs font-bold text-white text-center leading-tight mt-1">{item.name}</span>
      </div>
    </div>
  );
};
"""

text = text.replace(bad_rolepill.group(0), good_rolepill)

with open('src/components/game/NightOrderModal.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
