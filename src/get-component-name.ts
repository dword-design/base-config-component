import { pascalCase } from 'change-case';
import parsePackagejsonName from 'parse-packagejson-name';

import getPackageName from './get-package-name';

export default (config: { componentName? }, { cwd = '.' }) => {
  if (config.componentName) {
    return config.componentName;
  }

  const packageName = getPackageName({ cwd });
  return pascalCase(parsePackagejsonName(packageName).fullName);
};
