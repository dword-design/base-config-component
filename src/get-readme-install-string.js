import { endent, join } from '@dword-design/functions'

import getComponentName from './get-component-name.js'
import getPackageName from './get-package-name.js'
import { vueCdnScript } from './variables.js'

export default (config = {}) => {
  config.cdnExtraScripts = config.cdnExtraScripts || []

  const packageName = getPackageName()

  const componentName = getComponentName(config)

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
    import Vue from 'vue'
    import ${componentName} from '${packageName}'

    Vue.component('${componentName}', ${componentName})
    \`\`\`

    Or register as a plugin:

    \`\`\`js
    import Vue from 'vue'
    import ${componentName} from '${packageName}'

    Vue.use(${componentName})
    \`\`\`

    ## Install via CDN

    \`\`\`html
    ${
      [
        vueCdnScript,
        ...config.cdnExtraScripts,
        `<script src="https://unpkg.com/${packageName}"></script>`,
      ] |> join('\n')
    }
    \`\`\`
  `
}
