import { endent } from '@dword-design/functions'

import getComponentName from './get-component-name.js'

export default config => {
  const componentName = getComponentName(config)

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

    component.install = install

    export default component
  `
}
