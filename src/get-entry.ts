import endent from 'endent';

import getComponentName from './get-component-name';

export default (config: { componentName?: string }, { cwd = '.' } = {}) => {
  const componentName = getComponentName(config, { cwd });
  return endent`
    import type { App } from 'vue';

    import component from './src/index.vue';

    component.install = (app: App) => app.component('${componentName}', component);

    if (typeof globalThis !== 'undefined') {
      (globalThis as Record<string, unknown>).${componentName} = component;
    }

    export default component;
  `;
};
