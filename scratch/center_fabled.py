import re

with open('src/components/game/CenterStage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('import { RoleSelectionModal } from "./RoleSelectionModal";', 'import { RoleSelectionModal } from "./RoleSelectionModal";\nimport { AllRoles } from "../../data/roles";')

content = content.replace('  roomId\n}: CenterStageProps) => {', '  roomId,\n  fabled = []\n}: CenterStageProps) => {')

fabled_jsx = '''
        {/* 傳奇角色 */}
        <div className="bg-black/60 border border-yellow-500/30 rounded-xl p-3 shadow-lg backdrop-blur-md flex flex-col pointer-events-auto w-full">
          <h3 className="text-[10px] font-bold text-yellow-500/80 mb-2 border-b border-yellow-500/20 pb-1 text-center uppercase tracking-widest">傳奇角色</h3>
          <div className="flex flex-wrap gap-2 justify-center min-h-[40px]">
            {fabled.length > 0 ? fabled.map(fId => {
              const role = AllRoles.find(r => r.id === fId);
              if (!role) return null;
              return (
                <div key={fId} className="relative w-10 h-10">
                  <RoleIcon icon={role.icon} className="w-full h-full rounded-full border border-yellow-500/50 shadow-md bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)]" />
                </div>
              );
            }) : (
              <span className="text-white/30 text-xs my-auto">無傳奇角色</span>
            )}
          </div>
        </div>

        {/* 說書人標誌 */}
        <div className="bg-black/60 border border-white/20 rounded-xl p-3 shadow-lg pointer-events-auto backdrop-blur-md flex items-center justify-center w-full space-x-3">
           <div className="w-10 h-10 rounded-full bg-purple-900/50 border border-purple-500/50 flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.4)]">
             <span className="text-white font-serif font-bold">ST</span>
           </div>
           <span className="text-xs text-white/70 font-bold tracking-widest">說書人</span>
        </div>
'''

content = content.replace('      </div>\n\n      {/* 舞台中央 */}', fabled_jsx + '\n      </div>\n\n      {/* 舞台中央 */}')

with open('src/components/game/CenterStage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Added Fabled & ST indicator to CenterStage')
