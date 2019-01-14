import log from '../logger.js';

let tpkUtilsMethods = {};

tpkUtilsMethods.isAppInstalled = async function (pkg) {
  try {
    let installed = false;
    log.debug(`Getting install status for ${pkg}`);
    let stdout = await this.shell(`app_launcher --list | grep ${pkg}`);
    if (stdout.indexOf(`${pkg}`) > -1) {
      installed = true;
    }
    log.debug(`App is${!installed ? ' not' : ''} installed`);
    return installed;
  } catch (e) {
    log.errorAndThrow(`Error finding if app is installed. Original error: ${e.message}`);
  }
};

tpkUtilsMethods.startApp = async function (pkg, opts = {}) {
  try {
    log.debug(`Getting start app for ${pkg}`);
    let stdout = await this.shell([`app_launcher -s ${pkg}`], opts);
    return (stdout.indexOf('successfully') > -1) ? true : false;
  } catch (e) {
    log.errorAndThrow(`Error occured while starting App. Original error: ${e.message}`);
  }
};

tpkUtilsMethods.isStartedApp = async function (pkg, opts = {}) {
  try {
    log.debug(`Getting app startup status for ${pkg}`);
    let stdout = await this.shell([`app_launcher -S | grep ${pkg}`], opts);
    return (stdout.indexOf(`${pkg}`) > -1) ? true : false;
  } catch (e) {
    log.errorAndThrow(`Error occured while getting app startup status for App. Original error: ${e.message}`);
  }
};

tpkUtilsMethods.uninstall = async function (pkg) {
  log.debug(`Uninstalling ${pkg}`);
  try {
    await this.forceStop(pkg);
    let stdout = await this.sdbExec(['uninstall', pkg], { timeout: 20000 });
    if (stdout.indexOf('key[end] val[ok]') > -1) {
      return true;
    } else {
      log.errorAndThrow(`uninstall pkg failed: ${stdout}`);
      return false;
    }
  } catch (e) {
    log.errorAndThrow(`Unable to uninstall pkg. Original error: ${e.message}`);
  }
};

tpkUtilsMethods.installFromDevicePath = async function (tpkPathOnDevice) {
  let stdout = await this.shell([`pkgcmd -t tpk -i -p ${tpkPathOnDevice}`]);
  if (stdout.indexOf('key[end] val[ok]') > -1) {
    return true;
  } else {
    log.errorAndThrow(`Remote install failed: ${stdout}`);
    return false;
  }
};

tpkUtilsMethods.install = async function (tpk, pkg = null, replace = true, timeout = 60000) {
  if (replace) {
    let stdout = await this.sdbExec(['install', tpk], { timeout });
    return (stdout.indexOf('key[end] val[ok]') > -1) ? true : false;
  } else {
    try {
      if (pkg != null) {
        let result = this.isAppInstalled(pkg);
        if (!result) {
          await this.sdbExec(['install', tpk], { timeout });
          result = this.isAppInstalled(pkg);
          return result;
        } else {
          log.debug(`Application '${pkg}' already installed. Continuing.`);
          return false;
        }
      } else {
        log.debug(`Can't find app in device, because pkg name is null.`);
        return false;
      }
    } catch (e) {
      log.errorAndThrow(`Unable to install TPK. Original error: ${e.message}`);
    }
  }
};

export default tpkUtilsMethods;
