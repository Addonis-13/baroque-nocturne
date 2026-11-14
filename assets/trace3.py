# Trace le patchwork en niveaux de gris cumulés : chaque niveau est un seul chemin de traits
# horizontaux (une ligne par rangée de pixels), écrit en déplacements relatifs pour tenir
# dans la limite du décor. Usage : trace3.py <largeur de grille> <niveaux,...> <image>
import json, sys, numpy as np
from PIL import Image
gw = int(sys.argv[1]); levels = [float(v) for v in sys.argv[2].split(',')]
a = np.asarray(Image.open(sys.argv[3]).convert('L').resize((gw, gw * 10 // 16), Image.LANCZOS)).astype(np.float32) / 255
paths = []
for lv in levels:
    m = a >= lv; d = []; px, py = 0, 0; first = True
    for y in range(m.shape[0]):
        row = np.concatenate([[0], m[y].astype(np.int8), [0]]); ch = np.flatnonzero(np.diff(row))
        for s_, e_ in zip(ch[::2], ch[1::2]):
            if first: d.append(f"M{s_} {y}"); first = False
            else:
                dx, dy = s_ - px, y - py
                d.append(f"m{dx} {dy}" if dx >= 0 else f"m{dx} {dy}")
            d.append(f"h{e_ - s_}"); px, py = e_, y
    paths.append(''.join(d).replace(' -', '-'))
json.dump(paths, open(f'trace3-{gw}.json', 'w'))
print(gw, len(levels), 'chars', sum(map(len, paths)))
