import re

with open('src/components/game/RoleInfoModal.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Revert borders back to original, but add titleBorder
bad_groups = """  const groups = [
    { title: "鎮民", roles: townsfolk, color: "text-blue-300", bg: "bg-blue-900/20", border: "border-blue-400/40" },
    { title: "外來者", roles: outsider, color: "text-blue-200", bg: "bg-blue-800/20", border: "border-blue-300/40" },
    { title: "爪牙", roles: minion, color: "text-red-400", bg: "bg-red-900/20", border: "border-red-400/40" },
    { title: "惡魔", roles: demon, color: "text-red-500", bg: "bg-rose-900/20", border: "border-red-500/40" },
  ];"""

good_groups = """  const groups = [
    { title: "鎮民", roles: townsfolk, color: "text-blue-300", bg: "bg-blue-900/20", border: "border-blue-900/50", titleBorder: "border-blue-500/80" },
    { title: "外來者", roles: outsider, color: "text-blue-200", bg: "bg-blue-800/20", border: "border-blue-800/50", titleBorder: "border-blue-400/80" },
    { title: "爪牙", roles: minion, color: "text-red-400", bg: "bg-red-900/20", border: "border-red-900/50", titleBorder: "border-red-500/80" },
    { title: "惡魔", roles: demon, color: "text-red-500", bg: "bg-rose-900/20", border: "border-rose-900/50", titleBorder: "border-red-600/80" },
  ];"""
text = text.replace(bad_groups, good_groups)

# Add titleBorder to flatList
text = text.replace(
    "flatList.push({ type: 'header', title: group.title, color: group.color, border: group.border });",
    "flatList.push({ type: 'header', title: group.title, color: group.color, border: group.border, titleBorder: group.titleBorder });"
)

# Update the header render to use titleBorder and border-b-2
text = text.replace(
    "<h3 key={`h-${idx}`} className={`break-inside-avoid text-lg font-bold ${item.color} border-b ${item.border} pb-1 mb-3 mt-1 uppercase tracking-widest`}>",
    "<h3 key={`h-${idx}`} className={`break-inside-avoid text-lg font-bold ${item.color} border-b-2 ${item.titleBorder} pb-1 mb-3 mt-1 uppercase tracking-widest`}>"
)

# Make columnRule more obvious
text = text.replace(
    "columnRule: '1px solid rgba(255,255,255,0.1)'",
    "columnRule: '2px solid rgba(255,255,255,0.3)'"
)

with open('src/components/game/RoleInfoModal.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
