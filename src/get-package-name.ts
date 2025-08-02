import { readPackageSync } from 'read-pkg';

export default ({ cwd = '.' } = {}) => readPackageSync({ cwd }).name;
