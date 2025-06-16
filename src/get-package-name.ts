import loadPkg from 'load-pkg';

export default ({ cwd = '.' } = {}) => loadPkg.sync(cwd).name;
