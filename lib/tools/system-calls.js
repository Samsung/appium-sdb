import log from '../logger.js';
import { system } from 'appium-support';
import { exec } from 'teen_process';
import { retry } from 'asyncbox';
import _ from 'lodash';

let systemCallMethods = {};

const DEFAULT_SDB_EXEC_TIMEOUT = 20000;

systemCallMethods.getConnectedDevices = async function () {
  log.debug('Getting connected devices...');
  try {
    let { stdout } = await exec(this.executable.path, ['devices']);

    let startingIndex = stdout.indexOf('List of devices attached');
    stdout = stdout.slice(startingIndex);
    if (stdout.length < 1) {
      throw new Error('Could not find device.');
    } else {
      let devices = [];
      for (let line of stdout.split('\n')) {
        if (line.trim() !== '' && line.indexOf('List of devices') === -1) {
          let lineInfo = line.split('\t');
          devices.push({ udid: lineInfo[0].trim(), state: lineInfo[1].trim(), platform: lineInfo[2].trim() });
        }
      }
      log.debug(`${devices.length} device(s) connected`);
      return devices;
    }
  } catch (e) {
    log.errorAndThrow('Error while getting connected devices.');
  }
};

systemCallMethods.getDeviceStatus = async function () {
  let { stdout } = await exec(this.executable.path, ['get-state']);
  let result;
  if (stdout.indexOf('device' > -1)) {
    result = 'device';
  } else if (stdout.indexOf('offline' > -1)) {
    result = 'offline';
  } else if (stdout.indexOf('locked' > -1)) {
    result = 'locked';
  } else {
    result = 'unknown';
  }
  return result;
};

systemCallMethods.ConnectDevice = async function (device) {
  log.debug('Connect device...');
  try {
    let { stdout } = await exec(this.executable.path, ['connect', device]);

    if ((stdout.indexOf(`connected to ${device}`) > -1) || (stdout.indexOf('is already connected') > -1)) {
      log.debug(`${device} device(s) connected`);
      return true;
    } else {
      log.error(`Could not find device.`);
      return false;
    }
  } catch (e) {
    log.errorAndThrow('Error while connect devices.');
  }
};

systemCallMethods.getDevicesWithRetry = async function (timeoutMs = DEFAULT_SDB_EXEC_TIMEOUT) {
  let start = Date.now();
  let times = 0;
  log.debug('Trying to find a connected tizen device');
  let getDevices = async () => {
    if ((Date.now() - start) > timeoutMs || times > 10) {
      throw new Error('Could not find a connected tizen device.');
    }
    try {
      let devices = await this.getConnectedDevices();
      if (devices.length < 1) {
        times++;
        log.debug('Could not find devices, restarting sdb server...');
        await this.restartSdb();

        return await getDevices();
      }
      return devices;
    } catch (e) {
      times++;
      log.debug('Could not find devices, restarting sdb server...');
      await this.restartSdb();

      return await getDevices();
    }
  };
  return await getDevices();
};

systemCallMethods.restartSdb = async function () {
  if (this.suppressKillServer) {
    log.debug(`Not restarting sdb since 'suppressKillServer' is on`);
    return;
  }

  log.debug('Restarting sdb');
  try {
    await exec(this.executable.path, ['kill-server']);
    let { stdout } = await exec(this.executable.path, ['start-server']);
    return (stdout.indexOf('Server has started successfully') > -1) ? true : false;
  } catch (e) {
    log.error("Error killing SDB server, going to see if it's online anyway");
  }
};

systemCallMethods.sdbExec = async function (cmd, opts = {}) {
  if (!cmd) {
    throw new Error('You need to pass in a command to sdbExec()');
  }

  opts.timeout = opts.timeout || DEFAULT_SDB_EXEC_TIMEOUT;
  let execFunc = async () => {
    try {
      if (!(cmd instanceof Array)) {
        cmd = [cmd];
      }
      let args = this.executable.defaultArgs.concat(cmd);
      log.debug(`Running '${this.executable.path}' with args: ` +
        `${JSON.stringify(args)}`);
      let { stdout } = await exec(this.executable.path, args, opts);
      return stdout.trim();
    } catch (e) {
      if (e.stdout) {
        let stdout = e.stdout;
        return stdout;
      }
      throw new Error(`Error executing sdbExec. Original error: '${e.message}'; ` +
        `Stderr: '${(e.stderr || '').trim()}'; Code: '${e.code}'`);
    }
  };
  return await retry(2, execFunc);
};

systemCallMethods.shell = async function (cmd, opts = {}) {
  if (!await this.isDeviceConnected()) {
    throw new Error(`No device connected, cannot run sdb shell command '${cmd.join(' ')}'`);
  }
  let execCmd = ['shell'];
  if (cmd instanceof Array) {
    execCmd = execCmd.concat(cmd);
  } else {
    execCmd.push(cmd);
  }
  return await this.sdbExec(execCmd, opts);
};

systemCallMethods.getPortFromEmulatorString = function (emStr) {
  let portPattern = /emulator-(\d+)/;
  if (portPattern.test(emStr)) {
    return parseInt(portPattern.exec(emStr)[1], 10);
  }
  return false;
};

systemCallMethods.getConnectedEmulators = async function () {
  try {
    log.debug('Getting connected emulators');
    let devices = await this.getConnectedDevices();
    let emulators = [];
    for (let device of devices) {
      let port = this.getPortFromEmulatorString(device.udid);
      if (port) {
        device.port = port;
        emulators.push(device);
      }
    }
    log.debug(`${emulators.length} emulator(s) connected`);
    return emulators;
  } catch (e) {
    log.errorAndThrow(`Error getting emulators. Original error: ${e.message}`);
  }
};

systemCallMethods.setDeviceId = function (deviceId) {
  log.debug(`Setting device id to ${deviceId}`);
  this.curDeviceId = deviceId;
  let argsHasDevice = this.executable.defaultArgs.indexOf('-s');
  if (argsHasDevice !== -1) {
    this.executable.defaultArgs.splice(argsHasDevice, 2);
  }
  this.executable.defaultArgs.push('-s', deviceId);
};

systemCallMethods.setDevice = function (deviceObj) {
  let deviceId = deviceObj.udid;
  let emPort = this.getPortFromEmulatorString(deviceId);
  this.setEmulatorPort(emPort);
  this.setDeviceId(deviceId);
};

systemCallMethods.getSdbVersion = _.memoize(async function () {
  try {
    let sdbVersion = (await this.sdbExec('version'))
      .replace(/Smart\sDevelopment\sBridge\sversion\s([\d.]*)[\s\w-]*/, '$1');
    let parts = sdbVersion.split('.');
    return {
      versionString: sdbVersion,
      versionFloat: parseFloat(sdbVersion),
      major: parseInt(parts[0], 10),
      minor: parseInt(parts[1], 10),
      patch: parts[2] ? parseInt(parts[2], 10) : undefined,
    };
  } catch (e) {
    log.errorAndThrow(`Error getting sdb version. Original error: '${e.message}'; ` +
      `Stderr: '${(e.stderr || '').trim()}'; Code: '${e.code}'`);
  }
});

systemCallMethods.reboot = async function () {
  try {
    let result = await this.shell(['reboot']);
    if (result.indexOf('command not found') > -1) {
      log.debug('Device requires sdb to be running as root in order to reboot. Restarting daemon');
      await this.root();
      result = await this.shell(['reboot']);
      return true;
    }
    if (result.indexOf('Rebooting') > -1) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    log.warn(`Unable to reboot daemon: '${err.message}'.`);
    return false;
  }
};

systemCallMethods.root = async function () {
  try {
    await this.sdbExec(['root', 'on']);
    return true;
  } catch (err) {
    log.warn(`Unable to root sdb daemon: '${err.message}'. Continuing`);
    return false;
  }
};

systemCallMethods.unroot = async function () {
  try {
    await this.sdbExec(['root', 'off']);
    return true;
  } catch (err) {
    log.warn(`Unable to unroot sdb daemon: '${err.message}'. Continuing`);
    return false;
  }
};

systemCallMethods.fileExists = async function (remotePath) {
  let files = await this.ls(remotePath);
  return files.length > 0;
};

systemCallMethods.ls = async function (remotePath) {
  try {
    let stdout = await this.shell(['ls', remotePath]);
    let lines = stdout.split('\n');
    return lines.map((l) => l.trim())
      .filter(Boolean)
      .filter((l) => l.indexOf('No such file') === -1);
  } catch (err) {
    if (err.message.indexOf('No such file or directory') === -1) {
      throw err;
    }
    return [];
  }
};

systemCallMethods.getSdkBinaryPath = async function (binaryName) {
  let binaryLoc = null;
  let cmd = this.getCommandForOS();
  try {
    let { stdout } = await exec(cmd, [binaryName]);
    log.info(`Using ${binaryName} from ${stdout}`);

    binaryLoc = stdout.trim();
    return binaryLoc;
  } catch (e) {
    log.errorAndThrow(`Could not find ${binaryName} Please set the TIZEN_HOME ` +
      `environment variable with the Tizen SDK root directory path.`);
  }
};

systemCallMethods.getCommandForOS = function () {
  let cmd = 'which';
  if (system.isWindows()) {
    cmd = 'where';
  }
  return cmd;
};

systemCallMethods.setEmulatorPort = function (emPort) {
  this.emulatorPort = emPort;
};

systemCallMethods.killProcess = async function (process, opts = {}) {
  let result = await this.shell([`killall ${process}`], opts);

  if (result.indexOf('process not found') > -1) {
    log.error(`${process} process not found`);
    return false;
  } else {
    return true;
  }
};

systemCallMethods.checkProcessStatus = async function (process, opts = {}) {
  let result = await this.shell([`pgrep ${process}`], opts);
  return result.length > 0;
};

systemCallMethods.startExec = async function (exec, opts = {}) {
  let execPath = '/usr/bin/' + exec;
  await this.shell([execPath], opts);
};

systemCallMethods.stopAutoSleep = async function () {
  await this.root();
  await this.shell('devicectl display stop');
};

systemCallMethods.startAutoSleep = async function () {
  await this.root();
  await this.shell('devicectl display start');
};

export default systemCallMethods;
