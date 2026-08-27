import re

with open('src/components/game/GrimoireSettings.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Add distributeRoles and AlertDialog import
text = text.replace('import { updateRoomScript, updateSeatCount, setCustomScript, updateDistribution, applySetupToRoom, updateRoomSettings } from "../../services/roomService";', 'import { updateRoomScript, updateSeatCount, setCustomScript, updateDistribution, applySetupToRoom, updateRoomSettings, distributeRoles } from "../../services/roomService";\nimport { AlertDialog } from "../common/AlertDialog";')

# Update props interface
text = text.replace('  settings: any;\n}', '  settings: any;\n  players: any[];\n}')
text = text.replace('  settings\n}: GrimoireSettingsProps) => {', '  settings,\n  players\n}: GrimoireSettingsProps) => {')

# Add missing seat alert state
text = text.replace('  const [isDropdownOpen, setIsDropdownOpen] = useState(false);', '  const [isDropdownOpen, setIsDropdownOpen] = useState(false);\n  const [missingSeatAlert, setMissingSeatAlert] = useState<string | null>(null);')

# Add handleDistribute
handle_distribute = """  const handleDistribute = async () => {
    // 檢查是否有空位
    const missingSeats: number[] = [];
    for (let i = 1; i <= seatCount; i++) {
      if (!players.find(p => p.seat === i)) {
        missingSeats.push(i);
      }
    }
    
    if (missingSeats.length > 0) {
      setMissingSeatAlert(`無法分配角色：第 ${missingSeats.join('、')} 號座位目前沒有玩家坐下。請確保所有座位都有玩家。`);
      return;
    }
    
    // 如果沒缺，正式分配角色
    const playersDict: Record<string, any> = {};
    players.forEach(p => playersDict[p.uid] = p);
    await distributeRoles(roomId, playersDict, grimoireState || {}, bluffs, script);
    setMissingSeatAlert("分配完成！已將角色與資訊發送給所有玩家。"); // Using the same alert just to show success, but maybe without cancel? Wait, AlertDialog has confirm button.
  };"""

text = text.replace('  const [t, o, m, d] = distribution || [0, 0, 0, 0];', handle_distribute + '\n  const [t, o, m, d] = distribution || [0, 0, 0, 0];')

# Add Button at the bottom
button_and_alert = """
        {renderSettingsBlock()}

        <button 
          onClick={handleDistribute}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg shadow-lg border border-blue-400 mt-6 transition-transform hover:scale-[1.02]"
        >
          正式分配角色
        </button>

      </div>
      <AlertDialog 
        isOpen={!!missingSeatAlert} 
        onClose={() => setMissingSeatAlert(null)} 
        onConfirm={() => setMissingSeatAlert(null)} 
        message={missingSeatAlert || ""} 
        showCancel={false} 
      />
    </div>
  );
};
"""

text = re.sub(r'        \{renderSettingsBlock\(\)\}\n      </div>\n    </div>\n  \);\n};\n?', button_and_alert, text)

with open('src/components/game/GrimoireSettings.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
