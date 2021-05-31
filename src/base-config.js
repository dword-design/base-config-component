import loadPkg from 'load-pkg'

const baseConfig = loadPkg.sync()?.baseConfig

export default {
  cdnExtraScripts: [],
  ...(typeof baseConfig === 'object' ? baseConfig : {}),
}
