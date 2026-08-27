import re

files = ['src/components/game/CenterStage.tsx', 'src/components/game/Grimoire.tsx']

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        text = f.read()

    bad_size = """  const getSeatSize = () => {
    return 120;
  };"""

    good_size = """  const getSeatSize = () => {
    const count = typeof totalSeats !== 'undefined' ? totalSeats : seatCount;
    if (count <= 6) return 160;
    if (count <= 8) return 150;
    if (count <= 10) return 140;
    if (count <= 12) return 130;
    return 120;
  };"""

    text = text.replace(bad_size, good_size)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(text)
