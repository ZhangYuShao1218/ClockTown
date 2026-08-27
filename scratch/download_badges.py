import urllib.request
import os

demon_url = "https://wiki.bloodontheclocktower.com/images/5/52/Generic_demon.png"
outsider_url = "https://wiki.bloodontheclocktower.com/images/5/53/Generic_outsider.png"

public_icons = "public/icons"
os.makedirs(public_icons, exist_ok=True)

demon_path = os.path.join(public_icons, "demon_badge.png")
outsider_path = os.path.join(public_icons, "outsider_badge.png")

print("Downloading demon...")
urllib.request.urlretrieve(demon_url, demon_path)
print("Downloading outsider...")
urllib.request.urlretrieve(outsider_url, outsider_path)

print("Removing old jpgs...")
if os.path.exists(os.path.join(public_icons, "demon_badge.jpg")):
    os.remove(os.path.join(public_icons, "demon_badge.jpg"))
if os.path.exists(os.path.join(public_icons, "outsider_badge.jpg")):
    os.remove(os.path.join(public_icons, "outsider_badge.jpg"))

print("Updating NightOrderModal.tsx...")
with open("src/components/game/NightOrderModal.tsx", "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace('src="/icons/demon_badge.jpg"', 'src="/icons/demon_badge.png"')
text = text.replace('src="/icons/outsider_badge.jpg"', 'src="/icons/outsider_badge.png"')

with open("src/components/game/NightOrderModal.tsx", "w", encoding="utf-8") as f:
    f.write(text)

print("Done!")
