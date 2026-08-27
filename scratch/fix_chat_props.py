import re

with open('src/components/game/Chat.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

bad_props = """interface ChatProps {
  roomId: string;
  userUid: string;
  userName: string;
  isHost: boolean;
  players: any[];
  hostPlayer: any;
}

export const Chat = ({ roomId, userUid, userName, isHost, players, hostPlayer }: ChatProps) => {"""

good_props = """interface ChatProps {
  roomId: string;
  userUid: string;
  userName: string;
  isHost: boolean;
  players: any[];
  hostPlayer: any;
  isEvil?: boolean;
  settings?: any;
}

export const Chat = ({ roomId, userUid, userName, isHost, players, hostPlayer, isEvil, settings }: ChatProps) => {"""

text = text.replace(bad_props, good_props)

with open('src/components/game/Chat.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
