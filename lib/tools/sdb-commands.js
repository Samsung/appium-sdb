import log from '../logger.js';

let methods = {};

methods.getSdbWithCorrectSdbPath = async function () {
  this.executable.path = await this.getSdkBinaryPath('sdb');
  this.binaries.sdb = this.executable.path;
  return this.sdb;
};

methods.isDeviceConnected = async function () {
  let device = await this.getDeviceStatus();
  return (device === 'device');
};

methods.mkdir = async function (remotePath) {
  return await this.shell([`mkdir ${remotePath}`]);
};

methods.isValidClass = function (classString) {
  return new RegExp(/^[a-zA-Z0-9./_]+$/).exec(classString);
};

methods.forceStop = async function (pkg) {
  return await this.shell(['app_launcher', '-k', pkg]);
};

methods.getSdbPath = function () {
  return this.executable.path;
};

methods.rimraf = async function (path) {
  await this.shell(['rm', '-rf', path]);
};

methods.push = async function (localPath, remotePath, opts) {
  await this.sdbExec(['push', localPath, remotePath], opts);
};

methods.pull = async function (remotePath, localPath) {
  await this.sdbExec(['pull', remotePath, localPath], {timeout: 60000});
};

methods.processExists = async function (processName) {
  try {
    if (!this.isValidClass(processName)) {
      throw new Error(`Invalid process name: ${processName}`);
    }
    let stdout = await this.shell('ps -ef');
    for (let line of stdout.split(/\r?\n/)) {
      line = line.trim().split(/\s+/);
      let pkgColumn = line[line.length - 1];
      if (pkgColumn && pkgColumn.indexOf(processName) !== -1) {
        return true;
      }
    }
    return false;
  } catch (e) {
    log.errorAndThrow(`Error finding if process exists. Original error: ${e.message}`);
  }
};

methods.forwardPort = async function (systemPort, devicePort) {
  log.debug(`Forwarding system: ${systemPort} to device: ${devicePort}`);
  await this.sdbExec(['forward', `tcp:${systemPort}`, `tcp:${devicePort}`]);
};

methods.removePortForward = async function (systemPort) {
  log.debug(`Removing forwarded port socket connection: ${systemPort} `);
  await this.sdbExec(['forward', `--remove`, `tcp:${systemPort}`]);
};

methods.ping = async function () {
  let stdout = await this.shell(['echo', 'ping']);
  if (stdout.indexOf('ping') === 0) {
    return true;
  }
  throw new Error(`SDB ping failed, returned ${stdout}`);
};

methods.restart = async function () {
  try {
    return await this.restartSdb();
  } catch (e) {
    log.errorAndThrow(`Restart failed. Orginial error: ${e.message}`);
  }
};

methods.takeScreenShot = async function () {
  let stdout = await this.shell(['enlightenment_info -dump_screen']);
  if (stdout.indexOf('dump_screen.png') > -1) {
    return true;
  } else {
    return false;
  }
};

export default methods;
