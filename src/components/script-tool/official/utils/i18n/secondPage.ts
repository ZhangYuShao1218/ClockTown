export const cn = {
  'secondPage.addComponent': '新增元件',
  'secondPage.title': '第二頁標題',
  'secondPage.playerTable1': '玩家配置表（標準）',
  'secondPage.playerTable2': '玩家配置表（6-9人）',
  'playerTable.playerCount': '玩家數量',
  'playerTable.townsfolk': '鎮民',
  'playerTable.outsider': '外來者',
  'playerTable.minion': '爪牙',
  'playerTable.demon': '惡魔',
} as const;

export const en = {
  'secondPage.addComponent': 'Add Component',
  'secondPage.title': 'Second Page Title',
  'secondPage.playerTable1': 'Player Configuration (Standard)',
  'secondPage.playerTable2': 'Player Configuration (6-9 Players)',
  'playerTable.playerCount': 'Player Count',
  'playerTable.townsfolk': 'Townsfolk',
  'playerTable.outsider': 'Outsider',
  'playerTable.minion': 'Minion',
  'playerTable.demon': 'Demon',
} as const;

export const es: Partial<Record<keyof typeof cn, string>> = {
  'secondPage.addComponent': 'Añadir componente',
  'secondPage.title': 'Título de la segunda página',
  'secondPage.playerTable1': 'Tabla de configuración de jugadores (estándar)',
  'secondPage.playerTable2': 'Tabla de configuración de jugadores (6-9 jugadores)',
  'playerTable.playerCount': 'Jugadores',
  'playerTable.townsfolk': 'Aldeanos',
  'playerTable.outsider': 'Forasteros',
  'playerTable.minion': 'Esbirros',
  'playerTable.demon': 'Demonios',
};
