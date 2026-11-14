# Crédits des photos (Wikimedia Commons, CC0)

- Ange de Monteverde, cimetière de Staglieno : `Staglieno_30072015_16_Monteverde_Oneto_Angel.jpg`
- Aristée, Louvre : `Aristée_Bertin_Louvre_noir.jpg`
- Mercure, Louvre : `Mercure_Lefebvre_Louvre_MR1857_noir.jpg`
- Buste de Sénèque, château de Hautefort : `Sénèque_Château_de_Hautefort_16_(cropped).jpg`

Fabrication : `assets/collage.py` (photos dans `src/1.jpg`…`src/4.jpg`, à télécharger depuis Wikimedia Commons) écrit `statues.png` et
`tiles.json`, puis `assets/trace3.py 640 .02,.09,.18,.28,.39,.51,.64,.78,.9 statues.png`, dont le
JSON et les carrés vont dans `hooks/trace.ts`. Censure, sang et glitchs animés : `hooks/scene.ts`.
Une photo intégrée en `data:` n'est pas affichée par l'appli, d'où le tracé vectoriel.
