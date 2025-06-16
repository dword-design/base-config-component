import endent from 'endent';

import getComponentName from './get-component-name';
import getPackageName from './get-package-name';
import { vueCdnScript } from './variables';

export default (config, { cwd = '.' } = {}) => {
  config.cdnExtraScripts = config.cdnExtraScripts || [];
  const packageName = getPackageName({ cwd });
  const componentName = getComponentName(config, { cwd });
  return endent`
    ## Install via a package manager

    \`\`\`bash
    # npm
    $ npm install ${packageName}

    # Yarn
    $ yarn add ${packageName}
    \`\`\`

    Add to local components:

    \`\`\`html
    <script>
    import ${componentName} from '${packageName}'

    export default {
      components: {
        ${componentName},
      },
    }
    </script>
    \`\`\`

    Or register as a global component:

    \`\`\`js
    import ${componentName} from '${packageName}'

    app.component('${componentName}', ${componentName})
    \`\`\`

    Or register as a plugin:

    \`\`\`js
    import ${componentName} from '${packageName}'

    app.use(${componentName})
    \`\`\`

    ## Install via CDN

    \`\`\`html
    ${[
      vueCdnScript,
      ...config.cdnExtraScripts,
      `<script src="https://unpkg.com/${packageName}"></script>`,
    ].join('\n')}
    \`\`\`
  `;
};
