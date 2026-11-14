# Patchwork de statues pour le décor « Be not afraid » : silhouettes détourées et carrés
# de visages, posés sur un fond noir (le noir devient transparent au traçage).
# Coordonnées en unités du décor (1600 x 1000), image rendue à 2560 x 1600.
import json, numpy as np, sys
from PIL import Image, ImageFilter
K = 1.6; W, H = 2560, 1600

def load(p): return np.asarray(Image.open(p).convert('RGB')).astype(np.float32) / 255
def lum(a): return a[..., 0]*.3 + a[..., 1]*.59 + a[..., 2]*.11
def img(a): return Image.fromarray((np.clip(a, 0, 1)*255).astype(np.uint8))
def arr(i): return np.asarray(i).astype(np.float32) / 255
def resize(a, w, h): return arr(img(a).resize((max(1, w), max(1, h)), Image.LANCZOS))
def blur(a, r): return arr(img(a).filter(ImageFilter.GaussianBlur(r)))
def morph(a, f, n):
    i = img(a)
    for _ in range(n): i = i.filter(f(9))
    return arr(i)
def grade(a): return np.clip((lum(a) - .06) / .88, 0, 1) ** 1.2

canvas = np.zeros((H, W), np.float32)
acc = np.zeros((H, W), np.float32)
pieces = []

def put(gray, alpha, x, y):
    x, y = int(x*K), int(y*K); h, w = gray.shape
    xs, ys, xe, ye = max(0, x), max(0, y), min(W, x+w), min(H, y+h)
    if xe <= xs or ye <= ys: return
    g = gray[ys-y:ye-y, xs-x:xe-x]; a = alpha[ys-y:ye-y, xs-x:xe-x]
    canvas[ys:ye, xs:xe] = canvas[ys:ye, xs:xe]*(1-a) + g*a
    acc[ys:ye, xs:xe] = np.maximum(acc[ys:ye, xs:xe], a)
    pieces.append([xs/K, ys/K, xe/K, ye/K])

def cutout_black(src, crop=None):
    a = load(src)
    if crop: x, y, w, h = crop; a = a[y:y+h, x:x+w]
    m = blur(np.clip((lum(a) - .1) / .14, 0, 1), 2)
    return grade(a), m

def angel_mask(a):
    r, b = a[..., 0], a[..., 2]; mx = a.max(-1); mn = a.min(-1); L = lum(a); sat = (mx-mn)/(mx+1e-4)
    m = np.clip((L-.38)/.15, 0, 1)*np.clip((.22-sat)/.1, 0, 1)*np.clip((.12-(r-b))/.08, 0, 1)
    m = morph(m, ImageFilter.MaxFilter, 7); m = morph(m, ImageFilter.MinFilter, 7); m = blur(m, 4)
    hh = m.shape[0]; yy = np.linspace(0, 1, hh)[:, None]
    return m * np.clip((.62-yy)/.22, 0, 1)**1.2

def fit(gray, alpha, height=None, width=None):
    h, w = gray.shape
    if height: nh = int(height*K); nw = int(w*nh/h)
    else: nw = int(width*K); nh = int(h*nw/w)
    return resize(gray, nw, nh), resize(alpha, nw, nh)

def tile(src, crop, x, y, w, h):
    a = load(src); cx, cy, cw, ch = crop
    g = grade(a[cy:cy+ch, cx:cx+cw])
    g = resize(g, int(w*K), int(h*K)); put(g, np.ones_like(g), x, y)
    return [x, y, w, h]

def slices(g, a, n, s, seed):
    r = np.random.default_rng(seed); h = g.shape[0]
    for _ in range(n):
        y0 = int(r.integers(0, h-30)); hh = int(r.integers(3, 24)); d = int(r.integers(-s, s))
        g[y0:y0+hh] = np.roll(g[y0:y0+hh], d, 1); a[y0:y0+hh] = np.roll(a[y0:y0+hh], d, 1)

tiles = []
# gauche
an = load('src/1.jpg'); g, a = fit(grade(an), angel_mask(an), height=640); slices(g, a, 5, 40, 3); put(g, a, -60, 40)
tiles.append(['cr'] + tile('src/3.jpg', (800, 470, 340, 340), 318, 64, 170, 170))
g, a = fit(*cutout_black('src/3.jpg'), height=390); slices(g, a, 4, 30, 5); put(g, a, 236, 590)
tiles.append(['cy'] + tile('src/4.jpg', (640, 0, 640, 700), 34, 700, 150, 164))
# droite
g, a = fit(*cutout_black('src/4.jpg'), width=360); slices(g, a, 5, 50, 7); put(g, a, 1226, 24)
tiles.append(['pl'] + tile('src/1.jpg', (640, 80, 520, 560), 1134, 342, 186, 200))
g, a = fit(*cutout_black('src/2.jpg'), height=540); slices(g, a, 4, 30, 9); put(g, a, 1350, 350)
tiles.append(['cr'] + tile('src/2.jpg', (800, 150, 560, 560), 1196, 716, 140, 140))

img(canvas).save('statues.png'); img(acc).save('alpha.png')
json.dump(tiles, open('tiles.json', 'w')); json.dump(pieces, open('pieces.json', 'w'))
print(tiles)
