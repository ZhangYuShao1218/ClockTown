import re

with open('src/components/game/Room.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

guard_clauses = """  if (loading) {
    return <div className="flex h-screen items-center justify-center text-white/50 bg-black">讀取房間中...</div>;
  }

  if (error || !gameState) {
    return (
      <div className="flex flex-col h-screen items-center justify-center space-y-4 bg-black">
        <div className="text-red-500 font-medium">{error || "找不到房間"}</div>
        <button 
          onClick={() => navigate("/")}
          className="rounded-md bg-indigo-900 px-4 py-2 text-sm text-indigo-100 hover:bg-indigo-800 transition-colors border border-indigo-500/50"
        >
          返回大廳
        </button>
      </div>
    );
  }

  const isHost = gameState?.public?.hostId === user?.uid;"""

content = content.replace("  const isHost = gameState?.public?.hostId === user?.uid;", guard_clauses)

with open('src/components/game/Room.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Added guard clauses to Room.tsx")
