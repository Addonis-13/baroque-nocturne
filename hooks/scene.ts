// Décor de « Baroque nocturne » : deux coins de filigrane doré (volutes, acanthe,
// perles), prolongés par des pistes de circuit, et une lueur froide qui court
// le long de l'or. Le centre et le pied restent vides pour le texte et la saisie.

const VOLUTES = [
  'M110 78 C190 70 250 90 290 130 C320 160 300 200 268 196 C244 193 240 166 258 160 C270 156 280 166 274 176',
  'M78 110 C70 190 90 250 130 290 C160 320 200 300 196 268 C193 244 166 240 160 258 C156 270 166 280 176 274',
  'M290 130 C340 110 390 120 420 150 C440 170 470 165 480 140',
  'M130 290 C110 340 120 390 150 420 C170 440 165 470 140 480',
]

const pearls = (): string => {
  let out = ''

  for (let i = 0; i < 9; i++) {
    const p = 150 + i * 44

    out += `<circle class="gf" cx="${p}" cy="34" r="2.2"/><circle class="gf" cx="34" cy="${p}" r="2.2"/>`
  }

  return out
}

const corner = (delay: number): string => `
  <path class="g" d="M24 600 V96 Q24 24 96 24 H600"/>
  <path class="g thin" d="M44 600 V112 Q44 44 112 44 H600"/>
  ${pearls()}
  <circle class="g" cx="78" cy="78" r="16"/>
  <circle class="gf" cx="78" cy="78" r="5"/>
  <circle class="c dots" cx="78" cy="78" r="120"/>
  <g class="spin"><circle class="c arc" cx="78" cy="78" r="172"/></g>
  <path class="g" d="M90 90 C150 110 200 150 220 220 C150 200 110 150 90 90 Z"/>
  <path class="g thin" d="M90 90 Q160 150 220 220"/>
  ${VOLUTES.map(d => `<path class="g" d="${d}"/>`).join('')}
  <path class="c" d="M300 64 H460 L480 84 H580"/>
  <path class="c" d="M64 300 V460 L84 480 V580"/>
  <path class="c" d="M360 64 V40 H420"/>
  <path class="c" d="M64 360 H40 V420"/>
  <circle class="node" cx="580" cy="84" r="3.5" style="animation-delay:${delay}s"/>
  <circle class="node" cx="84" cy="580" r="3.5" style="animation-delay:${delay + 2}s"/>
  ${VOLUTES.map((d, i) => `<path class="run" pathLength="1000" d="${d}" style="animation-delay:${delay + i * 1.7}s"/>`).join('')}
  <path class="run" pathLength="1000" d="M24 600 V96 Q24 24 96 24 H600" style="animation-delay:${delay + 4}s;animation-duration:16s"/>
`

const DUST = [
  [6, 72, 0], [11, 88, 3], [17, 64, 6], [84, 30, 1.5], [90, 18, 4.5], [95, 40, 7.5], [4, 40, 9], [93, 62, 10.5],
]
  .map(([x, y, d]) => `<circle class="dust" cx="${x}%" cy="${y}%" r="1.6" style="animation-delay:${d}s"/>`)
  .join('')

export const SCENE = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
<style>
  .bg0{stop-color:#1c1424}.bg1{stop-color:#110c15}.bg2{stop-color:#08060a}
  .g{fill:none;stroke:#b8923f;stroke-width:1.6;stroke-linecap:round;opacity:.55}
  .thin{stroke-width:.8;opacity:.35}
  .gf{fill:#c9a24a;opacity:.55}
  .c{fill:none;stroke:#6fb8d6;stroke-width:1;opacity:.22}
  .dots{stroke-dasharray:2 10}
  .arc{stroke-dasharray:80 24 4 24;opacity:.18}
  .node{fill:#8fe3ff;opacity:.2;animation:pulse 6s ease-in-out infinite}
  .run{fill:none;stroke:#9fe8ff;stroke-width:2.2;stroke-linecap:round;stroke-dasharray:70 930;stroke-dashoffset:1000;opacity:.7;animation:run 11s linear infinite}
  .dust{fill:#e4c27a;opacity:0;animation:dust 14s ease-in-out infinite}
  .spin{transform-origin:78px 78px;animation:spin 140s linear infinite}
  @keyframes run{to{stroke-dashoffset:0}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes pulse{0%,100%{opacity:.15}50%{opacity:.75}}
  @keyframes dust{0%{opacity:0;transform:translateY(0)}30%{opacity:.6}100%{opacity:0;transform:translateY(-70px)}}
  @media (prefers-color-scheme: light){
    .bg0{stop-color:#f3ede3}.bg1{stop-color:#e7e0d4}.bg2{stop-color:#d9cfbf}
    .g{stroke:#8f6d24;opacity:.5}.gf{fill:#8f6d24}
    .c{stroke:#2f6f8f;opacity:.25}.node{fill:#2f7fa8}
    .run{stroke:#1f86b5;opacity:.55}.dust{fill:#9c7a2c}
  }
  @media (prefers-reduced-motion: reduce){*{animation:none!important}.run{opacity:0}}
</style>
<defs>
  <radialGradient id="bg" cx="50%" cy="42%" r="80%">
    <stop offset="0" class="bg0"/><stop offset=".6" class="bg1"/><stop offset="1" class="bg2"/>
  </radialGradient>
</defs>
<rect width="100%" height="100%" fill="url(#bg)"/>
<svg x="0" y="0" width="52%" height="52%" viewBox="0 0 600 600" preserveAspectRatio="xMinYMin meet">${corner(0)}</svg>
<svg x="48%" y="48%" width="52%" height="52%" viewBox="0 0 600 600" preserveAspectRatio="xMaxYMax meet">
  <g transform="translate(600 600) scale(-1 -1)">${corner(5.5)}</g>
</svg>
${DUST}
</svg>`
