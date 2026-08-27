const fs = require('fs');
let rs = fs.readFileSync('src/services/roomService.ts', 'utf8');
rs = rs.replace(/export const addVoteRecord[\s\S]*/, '');
rs += '\nexport const addVoteRecord = async (roomId: string, record: any) => {\n';
rs += '  const currentRef = ref(db, `rooms/${roomId}/public/voteHistory`);\n';
rs += '  const snapshot = await get(currentRef);\n';
rs += '  const history = snapshot.val() || [];\n';
rs += '  history.push(record);\n';
rs += '  await update(ref(db), { [`rooms/${roomId}/public/voteHistory`]: history });\n';
rs += '};\n';
fs.writeFileSync('src/services/roomService.ts', rs, 'utf8');

let vm = fs.readFileSync('src/components/game/VoteHistoryModal.tsx', 'utf8');
vm = vm.replace(/return seat !== undefined \? .* : '.*';/, "return seat !== undefined ? `${seat}. ${player?.name || '未知'}` : '未知';");
fs.writeFileSync('src/components/game/VoteHistoryModal.tsx', vm, 'utf8');
console.log('Fixed');
