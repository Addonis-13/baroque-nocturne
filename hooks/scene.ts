// Décor : un patchwork de statues tracées depuis de vraies photos (adouci par un flou) :
// yeux censurés, sang, orbites vides, tête en neige, yeux grattés ; carrés de couleur
// éteinte, brume ; par-dessus, des glitchs figés. Un voile au centre garde le
// chat lisible. Les teintes suivent le mode clair ou sombre.

import { TILES, TRACE, TRACE_W } from './trace'

// ---------- censure et sang (unités du décor, 1600 x 1000) ----------

// [cx, cy, largeur, hauteur, rotation]
const CENSOR: [number, number, number, number, number][] = [
  [142, 128, 78, 18, -10], // l'ange
  [1558, 432, 48, 12, -5], // Aristée en pied
  [1238, 431, 116, 28, -3], // visage de l'ange
]

const censor = CENSOR.map(
  ([x, y, w, h, r]) => `<rect class="cen" x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" transform="rotate(${r} ${x} ${y})"/>`,
).join('')

// [x, y, longueur, largeur, retard] : deux coulures seulement, pas symétriques
const BLOOD: [number, number, number, number, number][] = [
  [1426, 84, 150, 5, 1.8], // Sénèque, buste : un seul œil
  [1284, 791, 52, 3, 3.6], // Aristée, carré : un seul œil
]

const drip = ([x, y, l, w0, d]: [number, number, number, number, number]): string => {
  const w = w0 * 1.7
  const b = w * 0.75

  return `<g><path class="bl" d="M${x - w / 2} ${y} C${x - w / 2} ${y + l * 0.3} ${x - w * 0.2} ${y + l * 0.6} ${x - w * 0.3} ${y + l - b} A${b} ${b} 0 1 0 ${x + w * 0.3} ${y + l - b} C${x + w * 0.2} ${y + l * 0.6} ${x + w / 2} ${y + l * 0.3} ${x + w / 2} ${y} Z"/><path class="blh" d="M${x - w * 0.15} ${y + 4} L${x - w * 0.1} ${y + l * 0.7}"/></g><ellipse class="bl" cx="${x}" cy="${y + 1}" rx="${w * 1.1}" ry="${w * 0.7}"/>`
}

const blood = BLOOD.map(drip).join('')

// Carrés de couleur sous les visages : un double décalé (impression ratée) et une teinte.
const tilesUnder = TILES.map(
  ([c, x, y, w, h], i) => `<rect class="tm ${c}" x="${x + (i % 2 ? -14 : 12)}" y="${y + 10}" width="${w}" height="${h}"/>`,
).join('')
const tilesOver = TILES.map(
  ([c, x, y, w, h]) => `<rect class="tt ${c}" x="${x}" y="${y}" width="${w}" height="${h}"/><rect class="tl" x="${x - 6}" y="${y - 6}" width="${w + 12}" height="${h + 12}"/>`,
).join('')

// Ce qui rend les autres glauques : des orbites vides (visage de Mercure), une tête de
// Mercure en pied mangée par la neige d'un écran sans signal, et les yeux de Sénèque
// (carré) grattés sur la photo.
const hollow = `<g class="void" filter="url(#vb)"><ellipse cx="341" cy="96" rx="12" ry="6.5"/><ellipse cx="394" cy="94" rx="12" ry="6.5"/></g>`
const snowHead = `<clipPath id="hd"><ellipse cx="333" cy="645" rx="18" ry="26"/></clipPath><rect class="snow" x="314" y="618" width="38" height="54" filter="url(#tv)" clip-path="url(#hd)"/>`

const scratch = (x: number, y: number): string => {
  let d = ''
  for (let i = 0; i < 14; i++) {
    const a = x - 22 + ((i * 7) % 17) - 3
    const b = y - 12 + ((i * 5) % 11)
    d += `M${a} ${b}l${13 + (i % 4) * 5} ${i % 2 ? 14 : -10}l${-8 + (i % 3) * 6} ${i % 2 ? -7 : 12}l${16 - (i % 5) * 3} ${i % 3 ? 5 : -11}`
  }

  return `<path class="scr" d="${d}"/><path class="scr2" d="${d}" transform="translate(1 -1)"/>`
}
const scratched = scratch(74, 769) + scratch(113, 767)

// Ce qui se pose sur les statues, défini une fois et repris par chaque copie.
const OVERLAYS = `${tilesOver}<g filter="url(#wob)">${blood}</g>${censor}${hollow}${snowHead}${scratched}`

const S = 1600 / TRACE_W
const traceGroup = (paths: string[]): string =>
  `<g transform="scale(${S})" fill="none" stroke-width="1.08">${paths.map((d, i) => (d ? `<path class="t${i}" d="${d}"/>` : '')).join('')}</g>`

// Les teintes des niveaux passent par des variables : la copie rouge et la copie cyan du
// dédoublement réutilisent le même tracé avec d'autres variables, sans filtre (un filtre sur
// tout l'écran coûtait la moitié du rendu).
const TONES_D = ['#150f13', '#201a1e', '#2e272b', '#40383b', '#564e50', '#6f6867', '#8c8682', '#aca6a0', '#cdc7bf']
const TONES_L = ['#1e1a1b', '#2b2627', '#3d3738', '#534c4c', '#6c6564', '#888280', '#a7a19b', '#c6c0b8', '#e2ddd4']
const vars = (tones: string[], f: (h: string) => string): string => tones.map((h, i) => `--s${i}:${f(h)}`).join(';')
const red = (h: string): string => `#${h.slice(1, 3)}0000`
const cyan = (h: string): string => `#00${h.slice(3, 7)}`
const toneCss = (tones: string[]): string =>
  `.bna{${vars(tones, h => h)}}.chr{${vars(tones, red)}}.chc{${vars(tones, cyan)}}`

const STATUES = `<use href="#tr"/><use href="#ov"/>`

// Les copies découpées (tranches, traînées) ne montrent qu'une bande de l'image : elles ne
// reçoivent que les traits de cette bande, au lieu des statues entières, à rendu identique.
type Run = [number, number, number] // x, rangée, longueur (unités du tracé)
const RUNS: Run[][] = TRACE.map(d => {
  const out: Run[] = []
  let x = 0
  let y = 0

  for (const m of d.matchAll(/([Mm])(-?\d+) (\d+)|h(\d+)/g)) {
    if (m[4] !== undefined) {
      const l = Number(m[4])
      out.push([x, y, l])
      x += l
    } else if (m[1] === 'M') {
      x = Number(m[2])
      y = Number(m[3])
    } else {
      x += Number(m[2])
      y += Number(m[3])
    }
  }

  return out
})

// Les traits dont la rangée tombe entre y0 et y1 et qui touchent x0..x1 (unités du décor).
const band = (x0: number, y0: number, x1: number, y1: number): string =>
  traceGroup(
    RUNS.map(runs =>
      runs
        .filter(([x, y, l]) => y * S >= y0 - 3 && y * S <= y1 + 3 && (x + l) * S >= x0 && x * S <= x1)
        .map(([x, y, l], i, kept) => {
          // déplacements relatifs depuis la fin du trait précédent, comme dans le tracé
          const prev = kept[i - 1]

          return (prev ? `m${x - prev[0] - prev[2]} ${y - prev[1]}` : `M${x} ${y}`) + `h${l}`
        })
        .join(''),
    ),
  ) + '<use href="#ov"/>'

// Traînées : une ligne de pixels étirée vers le bas, comme un flux vidéo qui bave.
// [x, y, largeur, étirement]
const SMEARS: [number, number, number, number][] = [
  [1134, 470, 186, 40], // visage de l'ange
  [1350, 600, 250, 50], // Aristée
]
const smears = SMEARS.map(
  ([x, y, w, k], i) =>
    `<clipPath id="m${i}"><rect x="${x}" y="${y}" width="${w}" height="${3 * k}"/></clipPath><g clip-path="url(#m${i})"><g class="smear" transform="translate(0 ${y}) scale(1 ${k}) translate(0 ${-y})">${band(x, y, x + w, y + 3)}</g></g>`,
).join('')


// ---------- glitchs ----------

// [y, hauteur, x0, largeur] : tranches décalées, sur les statues
const SLICES: [number, number, number, number][] = [
  [110, 22, 0, 520],
  [640, 36, 0, 520],
  [60, 18, 1120, 480],
  [400, 30, 1120, 480],
]

const sliceDefs = SLICES.map(([y, h, x, w], i) => `<clipPath id="s${i}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath>`).join('')

const sliceUses = SLICES.map(
  ([y, h, x, w], i) => `<g clip-path="url(#s${i})"><g class="sl ${i % 2 ? 'r' : 'l'}">${band(x - 40, y, x + w + 40, y + h)}</g></g>`,
).join('')

// Générateur pseudo-aléatoire fixe : le décor est le même à chaque chargement.
let seed = 7
const rnd = (): number => {
  seed = (seed * 16807) % 2147483647

  return seed / 2147483647
}
const pick = <T,>(xs: T[]): T => xs[Math.floor(rnd() * xs.length)] as T
const COLS = ['cr', 'cy', 'pl', 'mg', 'mb']
// Les bords seulement : le centre (x 500 à 1100) reste au chat.
const edgeX = (w: number): number => (rnd() < 0.5 ? rnd() * (500 - w) : 1100 + rnd() * (500 - w))

const blocks = Array.from({ length: 22 }, (_, i) => {
  const w = 20 + Math.round(rnd() * 150)
  const h = 6 + Math.round(rnd() * 46)

  const x = Math.round(edgeX(w))
  const y = Math.round(rnd() * (1000 - h))
  const c = pick(COLS)

  // un bloc sur quatre visible, les autres tirés quand même pour garder la suite du hasard
  return i % 4 === 0 ? `<rect class="${c} b0" x="${x}" y="${y}" width="${w}" height="${h}"/>` : ''
}).join('')

const mosaic = (x0: number, y0: number, n: number, m: number, s: number): string => {
  let out = ''

  for (let j = 0; j < m; j++) {
    for (let i = 0; i < n; i++) {
      if (rnd() < 0.35) {
        continue
      }
      out += `<rect class="px ${pick(COLS)}" x="${x0 + i * s}" y="${y0 + j * s}" width="${s}" height="${s}"/>`
    }
  }

  return out
}

const stripes = Array.from({ length: 14 }, () => {
  const y = Math.round(rnd() * 1000)
  const w = 120 + Math.round(rnd() * 360)

  return `<rect class="st ${pick(['cr', 'cy', 'mg'])}" x="${Math.round(edgeX(w))}" y="${y}" width="${w}" height="${1 + Math.round(rnd() * 3)}"/>`
}).join('')

const BARS = ['#8a837c', '#6e6640', '#3c6266', '#3f5a44', '#5a2c4a', '#5e1a22', '#262a4a']
const bars = (x: number, y: number, w: number, h: number, cls: string): string =>
  `<g class="mire ${cls}">${BARS.map((c, i) => `<rect x="${x + (i * w) / BARS.length}" y="${y}" width="${w / BARS.length + 0.5}" height="${h}" fill="${c}"/>`).join('')}</g>`

// L'appli fige le décor (ni CSS ni SMIL n'y bougent) : les glitchs y sont figés.
const RAW = `<svg xmlns="http://www.w3.org/2000/svg" class="bna" width="100%" height="100%" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
<style>
  .bna{--bg:#0e0a0d;--veil:#0f0a0e;--veilo:.8;--blend:screen;--scan:.34;--hz1:#5a1420;--hz2:#2a1a36;--hz3:#16383c;--hz4:#3a1430;--hzo:.85;--cr:#3e0c14;--cy:#14302f;--pl:#24182a;--mg:#341424;--mb:#5e5752;--tl:#8a807a;--tto:.35;--grime:.5}
  ${TONES_D.map((_, i) => `.t${i}{stroke:var(--s${i})}`).join('')}
  ${toneCss(TONES_D)}
  @media (prefers-color-scheme:light){
    .bna{--bg:#a9a39c;--veil:#e3ded7;--veilo:.84;--blend:multiply;--scan:.1;--hz1:#a46a6a;--hz2:#8a8296;--hz3:#7f9895;--hz4:#9a7a86;--hzo:.6;--cr:#8e5a56;--cy:#6f8582;--pl:#7c7280;--mg:#86656f;--mb:#c9c2b8;--tl:#2a2226;--tto:.3;--grime:.35}
    .gd{display:none}.gl{display:inline}
    ${toneCss(TONES_L)}
  }
  .bgr{fill:var(--bg)}
  .grime{opacity:var(--grime)}
  .grain{opacity:.11}
  .gl{display:none}
  .bar{opacity:.45}
  .vs{stop-color:var(--veil)}
  .cr{fill:var(--cr)}.cy{fill:var(--cy)}.pl{fill:var(--pl)}.mg{fill:var(--mg)}.mb{fill:var(--mb)}
  .tm{opacity:.5}
  .tt{opacity:var(--tto);mix-blend-mode:multiply}
  .tl{fill:none;stroke:var(--tl);stroke-width:1;stroke-dasharray:3 5;opacity:.4}
  .cen{fill:#050404}
  .void{fill:#030203}
  .snow{opacity:.92}
  .scr{fill:none;stroke:#070506;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:bevel}
  .scr2{fill:none;stroke:#d8d2ca;stroke-width:.6;opacity:.7}
  .bl{fill:url(#blg)}
  .blh{fill:none;stroke:#a8343e;stroke-width:.8;stroke-linecap:round;opacity:.35}
  .haze{mix-blend-mode:var(--blend);opacity:var(--hzo)}
  .px{opacity:.35}
  .st{opacity:.4}
  .scan{fill:url(#scanp);opacity:var(--scan)}
  /* Glitchs figés, comme une image arrêtée en plein bug. */
  .smear{opacity:.7}
  .chr,.chc{mix-blend-mode:var(--blend);opacity:.35}
  .chr{transform:translate(-4px,0)}.chc{transform:translate(4px,1px)}
  .sl{transform:translateX(-30px)}.sl.r{transform:translateX(36px)}
  .b0{opacity:.4}
  .mire{opacity:.3}
</style>
<defs>
  <filter id="soft" x="0" y="0" width="100%" height="100%"><feGaussianBlur stdDeviation="1.1"/></filter>
  <filter id="wob" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".08" numOctaves="2" seed="5"/><feDisplacementMap in="SourceGraphic" scale="5"/></filter>
  <filter id="noise" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1.6 -.6"/></filter>
  <filter id="noiseD" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .1 0 0 0 0 .05 0 0 0 0 .1 0 0 0 1.6 -.6"/></filter>
  <filter id="barn" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9 .03" numOctaves="2" seed="9"/><feColorMatrix values="1.2 0 0 0 0 0 .5 0 0 0 0 0 .7 0 0 0 0 0 1.5 -.5"/></filter>
  <filter id="stain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".004 .006" numOctaves="4" seed="21"/><feColorMatrix values="0 0 0 0 .12 0 0 0 0 .08 0 0 0 0 .07 0 0 0 -2.4 1.5"/></filter>
  <pattern id="scanp" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1.4"/></pattern>
  <filter id="vb" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.6"/></filter>
  <filter id="tv" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="1" seed="1"/><feColorMatrix values="1.4 1.4 0 0 -1.05 1.4 1.4 0 0 -1.05 1.4 1.4 0 0 -1.05 0 0 0 0 1"/></filter>
  <linearGradient id="blg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a0207"/><stop offset=".5" stop-color="#560811"/><stop offset="1" stop-color="#72101a"/></linearGradient>
  <g id="ov">${OVERLAYS}</g>
  <g id="tr">${traceGroup(TRACE)}</g>
  <g id="ph">${STATUES}</g>
  <radialGradient id="vg" cx=".5" cy=".5" r=".75"><stop offset=".45" stop-color="#1a1216" stop-opacity="0"/><stop offset="1" stop-color="#1a1216" stop-opacity=".75"/></radialGradient>
  <radialGradient id="g1"><stop offset="0" style="stop-color:var(--hz1)" stop-opacity=".6"/><stop offset="1" style="stop-color:var(--hz1)" stop-opacity="0"/></radialGradient>
  <radialGradient id="g2"><stop offset="0" style="stop-color:var(--hz2)" stop-opacity=".55"/><stop offset="1" style="stop-color:var(--hz2)" stop-opacity="0"/></radialGradient>
  <radialGradient id="g3"><stop offset="0" style="stop-color:var(--hz3)" stop-opacity=".5"/><stop offset="1" style="stop-color:var(--hz3)" stop-opacity="0"/></radialGradient>
  <radialGradient id="g4"><stop offset="0" style="stop-color:var(--hz4)" stop-opacity=".5"/><stop offset="1" style="stop-color:var(--hz4)" stop-opacity="0"/></radialGradient>
  ${sliceDefs}
</defs>
<rect class="bgr" width="1600" height="1000"/>
<g>
  <ellipse class="haze h4" cx="1400" cy="820" rx="420" ry="300" fill="url(#g4)"/>
  ${tilesUnder}
  <use href="#ph" filter="url(#soft)"/>
  <use href="#tr" class="chr"/>
  <use href="#tr" class="chc"/>
  ${sliceUses}
  ${smears}
  <ellipse class="haze h1" cx="260" cy="720" rx="540" ry="320" fill="url(#g1)"/>
  <ellipse class="haze h2" cx="900" cy="420" rx="600" ry="380" fill="url(#g2)"/>
  <ellipse class="haze h3" cx="1320" cy="140" rx="420" ry="280" fill="url(#g3)"/>
  ${stripes}
  ${mosaic(450, 300, 6, 4, 9)}${mosaic(1110, 880, 8, 3, 9)}${mosaic(20, 560, 5, 5, 7)}${mosaic(1500, 230, 6, 6, 7)}
  ${bars(1430, 30, 150, 46, 'a')}
  ${blocks}
</g>
<rect class="grime" width="1600" height="1000" filter="url(#stain)"/>
<rect width="1600" height="1000" fill="url(#vg)"/>
<rect class="bar" y="612" width="1600" height="46" filter="url(#barn)"/>
<rect class="grain gd" x="-60" y="-60" width="1720" height="1120" filter="url(#noise)"/>
<rect class="grain gl" x="-60" y="-60" width="1720" height="1120" filter="url(#noiseD)"/>
<svg x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100" overflow="visible">
  <defs><linearGradient id="veil"><stop class="vs" offset="0" stop-opacity="0"/><stop class="vs" offset=".22" stop-opacity="0"/><stop class="vs" offset=".35" style="stop-opacity:var(--veilo)"/><stop class="vs" offset=".65" style="stop-opacity:var(--veilo)"/><stop class="vs" offset=".78" stop-opacity="0"/><stop class="vs" offset="1" stop-opacity="0"/></linearGradient></defs>
  <rect width="100" height="100" fill="url(#veil)"/>
</svg>
<rect class="scan" y="-4" width="1600" height="1008"/>
</svg>`

// Sans retours à la ligne ni indentation : l'appli a refusé le décor à 129 000 caractères.
export const SCENE = RAW.replace(/\n\s*/g, '')
