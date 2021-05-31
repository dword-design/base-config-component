import { endent, join } from '@dword-design/functions'

import baseConfig from './base-config'
import componentName from './component-name'
import packageName from './package-name'

export default endent`
  ## Install Via a Package Manager
  \`\`\`bash
  # npm
  $ npm install ${packageName}

  # Yarn
  $ yarn add ${packageName}
  \`\`\`

  Add to local components:

  \`\`\`js
  import ${componentName} from '${packageName}'

  export default {
    components: {
      ${componentName},
    },
  }
  \`\`\`

  Or register as global component:

  \`\`\`js
  import Vue from 'vue'
  import ${componentName} from '${packageName}'

  Vue.component('${componentName}', ${componentName})
  \`\`\`

  Or register as plugin:

  \`\`\`js
  import Vue from 'vue'
  import ${componentName} from '${packageName}'

  Vue.use(${componentName})
  \`\`\`

  ## Install Via CDN

  \`\`\`html
  ${
    [
      '<script src="https://unpkg.com/vue"></script>',
      ...baseConfig.cdnExtraScripts,
      `<script src="https://unpkg.com/${packageName}"></script>`,
    ] |> join('\n')
  }
  \`\`\`
`
