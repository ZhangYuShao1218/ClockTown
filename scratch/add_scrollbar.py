import re

with open('src/index.css', 'r', encoding='utf-8') as f:
    text = f.read()

custom_scrollbar = """
@layer utilities {
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.4);
  }
}
"""

text += custom_scrollbar

with open('src/index.css', 'w', encoding='utf-8') as f:
    f.write(text)
