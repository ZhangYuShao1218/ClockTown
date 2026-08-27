import re

with open('src/components/game/Room.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

auto_join_logic = """  useEffect(() => {
    if (!user || !id || !gameState) return;
    
    // Auto join if not in players list
    const name = localStorage.getItem("botc_player_name");
    if (name && !gameState.players?.[user.uid]) {
      import("../../services/roomService").then(({ joinRoom }) => {
         joinRoom(id, user.uid, name).catch(console.error);
      });
    }

    import("firebase/database").then(({ onDisconnect, ref, update }) => {
      import("../../services/firebase").then(({ db }) => {
        const playerOnlineRef = ref(db, `rooms/${id}/players/${user.uid}/isOnline`);
        update(ref(db), { [`rooms/${id}/players/${user.uid}/isOnline`]: true });
        onDisconnect(playerOnlineRef).set(false);
      });
    });
  }, [id, user, gameState]);"""

text = re.sub(r'  useEffect\(\(\) => \{\n    if \(\!user \|\| \!id \|\| \!gameState\) return;\n    import\("firebase/database"\).*?\}\);\n  \}, \[id, user, gameState\]\);', auto_join_logic, text, flags=re.DOTALL)

with open('src/components/game/Room.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
