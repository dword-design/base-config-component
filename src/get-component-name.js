import parsePackagejsonName from 'parse-packagejson-name'
import { pascalCase } from 'pascal-case'

import getPackageName from './get-package-name.js'

export default (config = {}) => {
  if (config.componentName) {
    return config.componentName
  }

  const packageName = getPackageName()

  return parsePackagejsonName(packageName).fullName |> pascalCase
}
