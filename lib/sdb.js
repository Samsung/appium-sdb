import _ from 'lodash';
import methods from './tools/index.js';

const DEFAULT_SDB_PORT = 26099;
const DEFAULT_OPTS = {
  sdkRoot: null,
  udid: null,
  executable: {path: 'sdb', defaultArgs: []},
  curDeviceId: null,
  emulatorPort: null,
  binaries: {},
  suppressKillServer: null,
  sdbPort: DEFAULT_SDB_PORT
};

class SDB {
  constructor (opts = {}) {
    if (typeof opts.sdkRoot === 'undefined') {
      opts.sdkRoot = process.env.TIZEN_HOME || '';
    }

    Object.assign(this, opts);
    _.defaultsDeep(this, _.cloneDeep(DEFAULT_OPTS));

    if (opts.remoteSdbPort) {
      this.sdbPort = opts.remoteSdbPort;
    }
  }
}

SDB.createSDB = async function (opts) {
  let sdb = new SDB(opts);
  await sdb.getSdbWithCorrectSdbPath();
  return sdb;
};

// add all the methods to the SDB prototype
for (let [fnName, fn] of _.toPairs(methods)) {
  SDB.prototype[fnName] = fn;
}

export default SDB;
export { DEFAULT_SDB_PORT };
