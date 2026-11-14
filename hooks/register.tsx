import type { Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'
import { SCENE } from './scene'

// Be not afraid : vraies statues de marbre (photos CC0) dans une brume sang et prune,
// passées au glitch (chromatique cassée, tranches décalées, pixels qui coulent).
// Clair et sombre, suit le système. Statues : assets/collage.py puis assets/trace3.py ; glitchs figés
// (l'appli n'anime pas le décor).
const built = makeColors({
  label: 'Be not afraid',
  roles: {
    accent: '#8a7f82',  // gris cendre, sobre : cadres, jauges et liens ne crient pas (le cyan reste au décor)
    danger: '#b8333a',  // sang séché, réservé aux vraies erreurs
    success: '#5f8f7a', // vert-de-gris éteint
    warning: '#b08a46', // or terni
    pro: '#8e6a86',     // prune fanée
  },
  light: {
    gray: {
      anchors: {
        'surface-0': '#d8d3cc',
        'surface-1': '#e0dbd4',
        'surface-2': '#e8e4de',
        'surface-3': '#e8e4de',
        'text-primary': '#1a1618',
        'text-secondary': '#3d3638',
        'text-muted': '#575052',
      },
    },
  },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#100c0f',
        'surface-1': '#161215',
        'surface-2': '#1c171a',
        'surface-3': '#221c20',
        'text-primary': '#e8e3dc',
        'text-secondary': '#c4bdb6',
        'text-muted': '#9e9693',
      },
    },
  },
})

// Le décor reste fixe : changer de scène pour l'animer le fait passer par un écran blanc,
// et l'appli ne le redessine pas de façon fiable. Il est dessiné en simple image (pas de
// cadre interactif). Testé le 14/11/2026 : sur ce poste, l'appli rame dès qu'un décor est
// posé, même un simple aplat ; ce n'est pas le contenu du dessin.
const LOOK: ThemeSetArgs = {
  colors: built.theme,
  backdrop: { scene: 'be-not-afraid', glass: { blur: 14, opacity: 0.66 } },
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const unpainted = built.problems.find(line => line.startsWith("Desktop won't paint"))

    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }
    const set = await $.theme.set(LOOK)

    if (!set.isDrawn) {
      $.ui.status(set.reason)
    }

    return next(e)
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if ((e.surface !== 'desktop' && e.surface !== 'mobile') || e.props.scene !== 'be-not-afraid') {
      return next(e)
    }
    const { Svg } = $.ui.resolve(e)

    return (
      <Svg
        source={SCENE}
        alt="Patchwork de statues, yeux censurés ou en sang, dans une brume sombre figée en plein glitch"
      />
    )
  })
}
