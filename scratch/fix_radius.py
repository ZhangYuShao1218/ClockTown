import re

def update_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()

    # Replace getSeatSize with getSeatConfig
    bad_size = """  const getSeatSize = () => {
    const count = typeof totalSeats !== 'undefined' ? totalSeats : seatCount;
    if (count <= 6) return 160;
    if (count <= 8) return 150;
    if (count <= 10) return 140;
    if (count <= 12) return 130;
    return 120;
  };"""

    good_config = """  const getSeatConfig = () => {
    const count = typeof totalSeats !== 'undefined' ? totalSeats : seatCount;
    if (count <= 6) return { size: 170, radius: 36 };
    if (count <= 8) return { size: 160, radius: 38 };
    if (count <= 10) return { size: 150, radius: 40 };
    if (count <= 12) return { size: 140, radius: 42 };
    if (count <= 14) return { size: 130, radius: 43.5 };
    return { size: 120, radius: 45 };
  };"""

    text = text.replace(bad_size, good_config)

    # Replace getSeatStyle
    bad_style = """  const getSeatStyle = (index: number) => {
    const angleDeg = (index / (typeof totalSeats !== 'undefined' ? totalSeats : seatCount)) * 360 - 90;
    const angleRad = (angleDeg * Math.PI) / 180;
    const radius = 45; 
    const x = 50 + radius * Math.cos(angleRad);
    const y = 50 + radius * Math.sin(angleRad);
    const size = getSeatSize();
    return { 
      left: `${x}%`, 
      top: `${y}%`, 
      transform: 'translate(-50%, -50%)',
      width: `${size}px`,
      height: `${size}px`
    };
  };"""
    
    # We will use regex to catch subtle differences in getSeatStyle
    text = re.sub(
        r'const getSeatStyle = \(index: number\) => \{[\s\S]*?const angleDeg = \(index \/ ([^\)]+)\) \* 360 - 90;[\s\S]*?const angleRad = \(angleDeg \* Math\.PI\) \/ 180;[\s\S]*?const radius = 45;[\s\S]*?const x = 50 \+ radius \* Math\.cos\(angleRad\);[\s\S]*?const y = 50 \+ radius \* Math\.sin\(angleRad\);[\s\S]*?const size = getSeatSize\(\);[\s\S]*?return \{[\s\S]*?left: `\$\{x\}%`,[\s\S]*?top: `\$\{y\}%`,[\s\S]*?transform: \'translate\(-50%, -50%\)\',[\s\S]*?width: `\$\{size\}px`,[\s\S]*?height: `\$\{size\}px`[\s\S]*?\};[\s\S]*?\};',
        r'''const getSeatStyle = (index: number) => {
    const angleDeg = (index / \1) * 360 - 90;
    const angleRad = (angleDeg * Math.PI) / 180;
    const { size, radius } = getSeatConfig(); 
    const x = 50 + radius * Math.cos(angleRad);
    const y = 50 + radius * Math.sin(angleRad);
    return { 
      left: `${x}%`, 
      top: `${y}%`, 
      transform: 'translate(-50%, -50%)',
      width: `${size}px`,
      height: `${size}px`
    };
  };''', text
    )

    # In CenterStage and Grimoire, the tooltip logic also calculates x and y inline
    text = re.sub(
        r'const angleRad = \(angleDeg \* Math\.PI\) \/ 180;\s*const x = 50 \+ 45 \* Math\.cos\(angleRad\);\s*const y = 50 \+ 45 \* Math\.sin\(angleRad\);',
        r'''const angleRad = (angleDeg * Math.PI) / 180;
              const { radius } = getSeatConfig();
              const x = 50 + radius * Math.cos(angleRad);
              const y = 50 + radius * Math.sin(angleRad);''', text
    )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(text)

update_file('src/components/game/CenterStage.tsx')
update_file('src/components/game/Grimoire.tsx')
