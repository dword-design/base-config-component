import { endent } from '@dword-design/functions'

import getComponentName from './get-component-name.js'

export default config => {
  const componentName = getComponentName(config)

  return endent`
    import component from './index.vue'

    component.install = app => app.component('${componentName}', component)

    if (typeof window !== 'undefined') {
      window.${componentName} = component
    }

    export default component
  `
}
