# appium-sdb

[![NPM version](http://img.shields.io/npm/v/appium-sdb.svg)](https://npmjs.org/package/appium-sdb)
[![Downloads](http://img.shields.io/npm/dm/appium-sdb.svg)](https://npmjs.org/package/appium-sdb)
[![Dependency Status](https://david-dm.org/Samsung/appium-sdb.svg)](https://david-dm.org/Samsung/appium-sdb)
[![devDependency Status](https://david-dm.org/Samsung/appium-sdb/dev-status.svg)](https://david-dm.org/Samsung/appium-sdb#info=devDependencies)
[![Build Status](https://travis-ci.org/Samsung/appium-sdb.svg?branch=master)](https://travis-ci.org/Samsung/appium-sdb)

A wrapper over tizen-sdb, implemented using ES6 and along with async/await. This package is mainly used by Appium to perform all sdb operations on tizen device.

## Usage:

example:

```js
import SDB, { DEFAULT_SDB_PORT } from 'appium-sdb';

let sdb = new SDB();

const opts = {
  sdkRoot: null,
  udid: null,
  executable: {path: 'sdb', defaultArgs: []},
  curDeviceId: null,
  emulatorPort: null,
  binaries: {},
  suppressKillServer: null,
  sdbPort: DEFAULT_SDB_PORT
};

let sdb2 = await SDB.createSDB(opts);

console.log(await sdb.getConnectedDevices());
```

### List of methods:

- `createSDB`
- `getSdbWithCorrectSdbPath`
- `getSdbVersion`
- `getSdbPath`
- `isDeviceConnected`
- `mkdir`
- `isValidClass`
- `forceStop`
- `rimraf`
- `push`
- `pull`
- `processExists`
- `forwardPort`
- `removePortForward`
- `ping`
- `restart`
- `getSdkBinaryPath`
- `ConnectDevice`
- `getCommandForOS`
- `getConnectedDevices`
- `getDeviceStatus`
- `getDevicesWithRetry`
- `getConnectedEmulators`
- `getPortFromEmulatorString`
- `restartSdb`
- `sdbExec`
- `shell`
- `setEmulatorPort`
- `setDeviceId`
- `reboot`
- `fileExists`
- `isAppInstalled`
- `startApp`
- `uninstall`
- `installFromDevicePath`
- `install`
- `root`
- `unroot`
- `takeScreenShot`
- `startExec`
- `checkProcessStatus`
- `killProcess`
