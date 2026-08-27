import re

with open('src/services/roomService.ts', 'r', encoding='utf-8') as f:
    text = f.read()

distribute_code = """
export const distributeRoles = async (roomId: string, players: Record<string, any>, grimoire: any, bluffs: any[], script: any, settings: any) => {
  const updates: Record<string, any> = {};
  
  const evilPlayers: {uid: string, name: string, roleId: string, type: string, seat: number}[] = [];
  
  Object.entries(players).forEach(([uid, p]) => {
    const seat = p.seat;
    if (seat && grimoire[seat]) {
      const roleId = grimoire[seat].roleId;
      const roleDef = script?.roles.find((r: any) => r.id === roleId);
      if (roleDef && (roleDef.type === 'demon' || roleDef.type === 'minion')) {
        evilPlayers.push({ uid, name: p.name, roleId, type: roleDef.type, seat });
      }
    }
  });

  Object.entries(players).forEach(([uid, p]) => {
    const seat = p.seat;
    if (seat && grimoire[seat]) {
      const roleId = grimoire[seat].roleId;
      const roleDef = script?.roles.find((r: any) => r.id === roleId);
      
      updates[`rooms/${roomId}/players/${uid}/roleId`] = roleId;
      
      if (roleDef) {
        let flavor = "";
        if (roleDef.type === 'demon' || roleDef.type === 'minion') {
          flavor = `你是黑鍾鎮隱藏的邪惡存在 一段被遺忘的過去\n人們是如此稱呼你 ${roleDef.name}\n\n`;
        } else {
          flavor = `你是這迷霧重重的黑鍾鎮中，尋求真相與希望的光芒\n人們是如此稱呼你 ${roleDef.name}\n\n`;
        }

        let info = `${flavor}你是黑鍾鎮的 - ${roleDef.name}\n你的能力是 - ${roleDef.ability}`;

        if (settings?.evilKnowsEachOther && (roleDef.type === 'demon' || roleDef.type === 'minion')) {
          info += `\n\n【邪惡陣營資訊】\n`;
          evilPlayers.forEach(e => {
             const eRole = script?.roles.find((r: any) => r.id === e.roleId);
             info += `第 ${e.seat} 號座位：${e.name} (${eRole ? eRole.name : '未知'})\n`;
          });
          if (roleDef.type === 'demon' && bluffs && bluffs.length > 0) {
             const bluffNames = bluffs.map(b => script?.roles.find((r:any)=>r.id===b)?.name || b).filter(Boolean);
             info += `\n你的偽裝牌是：${bluffNames.join('、')}`;
          }
        }
        
        updates[`rooms/${roomId}/players/${uid}/info`] = info;
      }
    } else {
      updates[`rooms/${roomId}/players/${uid}/roleId`] = null;
      updates[`rooms/${roomId}/players/${uid}/info`] = null;
    }
  });
  
  await update(ref(db), updates);
};
"""

text = re.sub(r'export const distributeRoles = async \(roomId: string, players: Record<string, any>, grimoire: any, bluffs: any\[\], script: any\) => \{.*?\};\n', distribute_code, text, flags=re.DOTALL)

with open('src/services/roomService.ts', 'w', encoding='utf-8') as f:
    f.write(text)
