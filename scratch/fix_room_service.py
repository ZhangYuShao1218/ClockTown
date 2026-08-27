import re

with open('src/services/roomService.ts', 'r', encoding='utf-8') as f:
    text = f.read()

distribute_code = """
export const distributeRoles = async (roomId: string, players: Record<string, any>, grimoire: any, bluffs: any[], script: any) => {
  const updates: Record<string, any> = {};
  
  // First collect evil players
  const evilPlayers: {uid: string, name: string, roleId: string, type: string}[] = [];
  
  Object.entries(players).forEach(([uid, p]) => {
    const seat = p.seat;
    if (seat && grimoire[seat]) {
      const roleId = grimoire[seat].roleId;
      const roleDef = script?.roles.find((r: any) => r.id === roleId);
      if (roleDef && (roleDef.type === 'demon' || roleDef.type === 'minion')) {
        evilPlayers.push({ uid, name: p.name, roleId, type: roleDef.type });
      }
    }
  });

  // Assign roles and info
  Object.entries(players).forEach(([uid, p]) => {
    const seat = p.seat;
    if (seat && grimoire[seat]) {
      const roleId = grimoire[seat].roleId;
      const roleDef = script?.roles.find((r: any) => r.id === roleId);
      
      updates[`rooms/${roomId}/players/${uid}/roleId`] = roleId;
      
      let info = "";
      if (roleDef?.type === 'demon') {
        const minions = evilPlayers.filter(e => e.type === 'minion').map(e => e.name).join('、');
        info = `你是惡魔。${minions ? `你的爪牙是：${minions}。` : ''} 你的偽裝牌是：${bluffs.map(b => script?.roles.find((r:any)=>r.id===b)?.name || b).join('、')}。`;
      } else if (roleDef?.type === 'minion') {
        const demon = evilPlayers.find(e => e.type === 'demon');
        const otherMinions = evilPlayers.filter(e => e.type === 'minion' && e.uid !== uid).map(e => e.name).join('、');
        info = `你是爪牙。惡魔是：${demon ? demon.name : '未知'}。${otherMinions ? `其他爪牙是：${otherMinions}。` : ''}`;
      } else if (roleDef?.type === 'townsfolk') {
        info = `你是鎮民。請盡力找出惡魔！`;
      } else if (roleDef?.type === 'outsider') {
        info = `你是外人。你的存在可能會對善良陣營造成阻礙。`;
      }
      
      updates[`rooms/${roomId}/players/${uid}/info`] = info;
    } else {
      // If no role assigned, clear it
      updates[`rooms/${roomId}/players/${uid}/roleId`] = null;
      updates[`rooms/${roomId}/players/${uid}/info`] = null;
    }
  });
  
  await update(ref(db), updates);
};
"""

text += distribute_code

with open('src/services/roomService.ts', 'w', encoding='utf-8') as f:
    f.write(text)
