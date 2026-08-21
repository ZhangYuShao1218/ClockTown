import re

with open('src/components/game/GrimoireSettings.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's remove the Fabled block and the floating `)}`
fabled_pattern = r'\{/\*.*?角色.*?\*/\}\s*\{fabledRoles\.length > 0 && \([\s\S]*?\}\)\}\s*</div>\s*</div>\s*\)\}'

content = re.sub(fabled_pattern, '', content, flags=re.DOTALL)

# But wait, renderSettingsBlock is inside `{script && (` originally? 
# In the snippet:
#             )}
#             
#             {renderSettingsBlock()}
#           </div>
#         )}
# We need to make sure `{renderSettingsBlock()}` is kept but the `)}` is removed.

content = content.replace('            {renderSettingsBlock()}\n          </div>\n        )}\n      </div>\n    </div>\n  );\n};', '            {renderSettingsBlock()}\n      </div>\n    </div>\n  );\n};')

# Also delete the Fabled Roles block
fabled_match = re.search(r'\{/\*.*?角色.*?\*/\}[\s\S]*?</div>\s*</div>\s*\)', content)
if fabled_match:
    content = content.replace(fabled_match.group(0), '')

with open('src/components/game/GrimoireSettings.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Cleaned up GrimoireSettings syntax")
