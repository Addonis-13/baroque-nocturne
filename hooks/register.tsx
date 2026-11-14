import type { Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'
import { SCENE } from './scene'

// Baroque nocturne : encre aubergine et or patiné la nuit, ivoire et dorure le jour.
// Les fonds prennent la teinte de l'accent (comme Sprint Engine), l'erreur est un rouge brique.
const built = makeColors({
  label: 'Baroque nocturne',
  roles: {
    accent: '#c9a24a',  // or patiné
    danger: '#b4442f',  // rouge brique, pas framboise
    success: '#4f9e86', // vert-de-gris
    warning: '#d08a2c', // ambre
    pro: '#8e62d4',     // violet irisé
  },
  light: {
    gray: {
      anchors: {
        'surface-0': '#e7e0d4',
        'surface-1': '#efe9df',
        'surface-2': '#f7f3ec',
        'text-primary': '#1d1521',
        'text-secondary': '#43384a',
        'text-muted': '#5e5263',
      },
    },
  },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#110c15',
        'surface-1': '#18121e',
        'surface-2': '#1f1726',
        'surface-3': '#261d2e',
        'text-primary': '#efe7d8',
        'text-secondary': '#cdc2b2',
        'text-muted': '#a69a8c',
      },
    },
  },
})

const LOOK: ThemeSetArgs = {
  colors: built.theme,
  backdrop: { scene: 'baroque-nocturne', glass: { blur: 18, opacity: 0.74 } },
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
    if ((e.surface !== 'desktop' && e.surface !== 'mobile') || e.props.scene !== 'baroque-nocturne') {
      return next(e)
    }
    const { Svg } = $.ui.resolve(e)

    return (
      <Svg
        source={SCENE}
        alt="Filigranes baroques dorés dans deux coins, parcourus par une lueur froide, sur un fond d'encre aubergine"
        isInteractive
      />
    )
  })
}
