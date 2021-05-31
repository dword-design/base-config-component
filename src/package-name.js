import loadPkg from 'load-pkg'
import parsePackagejsonName from 'parse-packagejson-name'

const packageConfig = loadPkg.sync()

export default parsePackagejsonName(packageConfig.name).fullName
