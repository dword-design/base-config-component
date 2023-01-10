import { endent } from '@dword-design/functions'

import getComponentName from './get-component-name.js'

export default () => {
  const componentName = getComponentName()

  return endent`
    // Import vue component
    import component from './index.vue'

    const install = app => {
      if (install.installed) return
      install.installed = true
      app.component('${componentName}', component)
    };

    component.install = install

    if (typeof window !== 'undefined') {
      window.${componentName} = component
    }

    export default component
  `
}
