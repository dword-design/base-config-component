import { endent } from '@dword-design/functions'

import getComponentName from './get-component-name.js'

export default config => {
  const componentName = getComponentName(config)

  return endent`
    // Import vue component
    import component from './index.vue';

    const install = function installVueIcon(Vue) {
      if (install.installed) return;
      install.installed = true;
      Vue.component('${componentName}', component);
    };

    component.install = install

    if (typeof window !== 'undefined') {
      window.${componentName} = component
    }

    component.install = install;

    export default component;
  `
}
